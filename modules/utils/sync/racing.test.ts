import * as checks from "./racing.check.ts";
//import { perform } from "/modules/test.prep.ts";

// perform.call({}, checks);

// deno test --unstable --import-map=/import_map.json

const {
  check_racing,
} = checks;

Deno.test(check_racing);
