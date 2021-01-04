import { parse } from "https://deno.land/std@0.82.0/flags/mod.ts"; // "/#/std/flags/mod.ts";
import { serve } from "https://deno.land/std@0.82.0/http/server.ts"; // "/#/std/http/server.ts";

import { passable } from "../utils/sync/passfail.ts";
import { competing, quit } from "../utils/sync/racing.ts";
import { handleRequest } from "./mod.ts";

// HTTP_PROXY=http://127.0.0.1:3366 deno

const localhost = "localhost(:[1-9][0-9]*)?";

const flags = parse(Deno.args);

const match = flags.ignore ?? localhost;

const debug = Number(flags.v) > 0 ? console.log.bind(console) : () => {};

const address = "127.0.0.1:" + (flags.port || flags.p || "3366");

const server = serve(address);

const ignore = match ? new RegExp(match) : undefined;

const env: any = {
  log: [Promise.resolve({ debug }), { debug }],
};

const using = (dependency: string) => {
  return env[dependency] || [undefined, undefined];
};

let cancellation = passable() as (undefined | ReturnType<typeof passable>);

export function stop(raceable: any) {
  if (!cancellation) return false;

  const [, halt] = cancellation;

  Promise.resolve(raceable).then(halt, function ignore() {});

  return true;
}

// async function futureRequest() {
//   for await (const req of server) return req;

//   throw null; // ...keeps undefined out of the return type
// }

console.log(`Denosrc proxy listening on http://${address}/`);
export const finished = Promise.resolve().then(async () => {
  const [timeout] = cancellation || [];

  // const cancel = timeout && { future: timeout, resolve: quit, reject: quit };

  try {
    timeout?.finally(() => server.close()); // TODO: investigate why racing futureRequest fails

    for await(const req of server) {
      handleRequest({ req, ignore, using }).catch((reason) => {
        if (competing(reason, timeout)) return; // ignore this failure

        debug("Error in handleRequest: " + reason?.label ?? reason);
      });
    }
  } catch (reason) {
    console.log("dead", reason);
    if (competing(reason, timeout)) throw reason;

    throw reason;
  }
});

finished.finally(() => {
  cancellation = undefined;

  // server.close();
  console.log(`Denosrc proxy closed off http://${address}/`);
  quit();
}).catch(function ignore() {});
