import * as checks from "./inspection.check.ts";
//import { perform } from "/modules/test.prep.ts";

// perform.call({}, checks);

// deno test --unstable --import-map=/import_map.json

const {
  check_inpection,
} = checks;

Deno.test(check_inpection);
