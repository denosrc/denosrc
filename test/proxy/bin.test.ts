import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts"; // "/#/std/http/server.ts";
import { stop } from "../../modules/proxy/bin.ts";

// HTTP_PROXY=http://127.0.0.1:3366 deno test --allow-net

Deno.test("TODO", () => {});

stop(new Promise((resolve) => setTimeout(resolve, 3000)));
