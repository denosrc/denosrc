import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts"; // "/#/std/http/server.ts";

import { quit, competing, racing } from "../utils/sync/racing.ts";
import {
  hasContextAwareHostname,
  rewriteContextualizedURL,
} from "./utils/url/mod.ts";

// patch version: alters (shallow) internal code -- should require no consumer changes (neither to internal code nor to importmap)
// minor version: alters (deep) external dependency -- should require no changes to consumer internal code but may require changes to consumer importmap
// major version: alters compatibility expectations -- may require changes to consumer internal code and/or consumer inmportmap

export async function handleRequest<Timeout>({ timeout, req, ignore, using }: {
  timeout?: Promise<Timeout>;
  req: ServerRequest;
  ignore?: RegExp;
  using?: any;
}) {
  const cancel = timeout && { future: timeout, resolve: quit, reject: quit };

  const [futureLog, log = await futureLog] = using?.("log");

  const parsed = new URL(req.url);
  const contextual = hasContextAwareHostname(parsed);

  if (!contextual || ignore?.test(parsed.host)) {
    return await racing("proxyRequest non-contextual\n\n -- ", "cancel", {
      cancel,
      use: {
        future: proxyRequest({ timeout, req, url: req.url }),
      },
    });
  } else {
    const url = rewriteContextualizedURL(parsed);

    log?.debug?.(`Rewriting contextualized URL\n- ${req.url}\n+ ${url}\n`);

    return await racing("proxyRequest contextual \n\n -- ", "cancel", {
      cancel,
      use: {
        future: proxyRequest({ timeout, req, url }),
      },
    });
  }
}

export async function proxyRequest<Timeout>({ timeout, req, url = req.url }: {
  timeout?: Promise<Timeout>;
  req: ServerRequest;
  url: string;
}) {
  const cancel = timeout && { future: timeout, resolve: quit, reject: quit };

  try {
    // TODO: leverage streaming
    const body = await racing("Deno.readAll\n\n -- ", "cancel", {
      cancel,
      use: { future: Deno.readAll(req.body) },
    });

    // TODO: clean up or use RequestInit options
    // TODO: support redirects -- test against http://denosrc//http://deno.land/std@0.82.0/log/levels.ts
    const res = await racing("fetch\n\n -- ", "cancel", {
      cancel,
      use: {
        future: fetch(url, {
          /**
           * A BodyInit object or null to set request's body.
           */
          body: body,
          /**
           * A string indicating how the request will interact with the browser's cache
           * to set request's cache.
           */
          // cache?: RequestCache;
          /**
           * A string indicating whether credentials will be sent with the request
           * always, never, or only when sent to a same-origin URL. Sets request's
           * credentials.
           */
          // credentials?: RequestCredentials;
          /**
           * A Headers object, an object literal, or an array of two-item arrays to set
           * request's headers.
           */
          headers: req.headers,
          /**
           * A cryptographic hash of the resource to be fetched by request. Sets
           * request's integrity.
           */
          // integrity?: string;
          /**
           * A boolean to set request's keepalive.
           */
          // keepalive?: boolean;
          /**
           * A string to set request's method.
           */
          method: req.method,
          /**
           * A string to indicate whether the request will use CORS, or will be
           * restricted to same-origin URLs. Sets request's mode.
           */
          // mode?: RequestMode;
          /**
           * A string indicating whether request follows redirects, results in an error
           * upon encountering a redirect, or returns the redirect (in an opaque
           * fashion). Sets request's redirect.
           */
          // redirect: "follow",
          /**
           * A string whose value is a same-origin URL, "about:client", or the empty
           * string, to set request's referrer.
           */
          // referrer?: string;
          /**
           * A referrer policy to set request's referrerPolicy.
           */
          // referrerPolicy?: ReferrerPolicy;
          /**
           * An AbortSignal to set request's signal.
           */
          // signal?: AbortSignal | null;
          /**
           * Can only be null. Used to disassociate request from any Window.
           */
          // window?: any;
        }),
      },
    });

    // TODO: leverage streaming
    const data = new Uint8Array(
      await racing("res.arrayBuffer\n\n -- ", "cancel", {
        cancel,
        use: { future: res.arrayBuffer() },
      }),
    );

    // TODO: support trailing headers
    return await racing("req.respond try\n\n -- ", "cancel", {
      cancel,
      use: {
        future: req.respond({
          status: res.status,
          headers: res.headers,
          body: data,
          // trailers?: () => Promise<Headers> | Headers;
        }),
      },
    });
  } catch (reason) {
    console.log({ reason });
    if (competing(reason, timeout)) throw reason;

    // TODO: handle failures appropriately
    throw await req.respond({
      status: 500,
      body: JSON.stringify({
        error: reason?.value ?? reason,
      }),
    }) // no retry...
      .then(quit).catch(() => quit(reason));
  }
}
