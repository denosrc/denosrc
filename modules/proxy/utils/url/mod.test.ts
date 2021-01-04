import * as checks from "./mod.check.ts";
//import { perform } from "/modules/test.prep.ts";

// perform.call({}, checks);

// deno test --unstable --import-map=/import_map.json

const {
  check_context_aware_hostnames_have_no_dots,
  check_double_slash_path_context_rewrites,
  check_other_path_slash_count_context_rewrites,
  check_single_slash_path_context_rewrites,
  check_slash_only_path_context_rewrites,
} = checks;

Deno.test(check_context_aware_hostnames_have_no_dots);

Deno.test(check_double_slash_path_context_rewrites);

Deno.test(check_other_path_slash_count_context_rewrites);

Deno.test(check_single_slash_path_context_rewrites);

Deno.test(check_slash_only_path_context_rewrites);
