import * as checks from "./passfail.check.ts";
//import { perform } from "/modules/test.prep.ts";

// perform.call({}, checks);

// deno test --unstable --import-map=/import_map.json

const {
  check_passfail,
} = checks;

Deno.test(check_passfail);
