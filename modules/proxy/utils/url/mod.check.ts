import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.82.0/testing/asserts.ts";
import { hasContextAwareHostname, rewriteContextualizedURL } from "./mod.ts";

export const check_context_aware_hostnames_have_no_dots = {
  name: "check_context_aware_hostnames_have_no_dots",
  fn() {
    assert(hasContextAwareHostname(new URL("https://denosrc/")));

    assert(hasContextAwareHostname(new URL("http://localhost:8000/")));

    assert(!hasContextAwareHostname(new URL("http://denosrc.com/")));

    assert(!hasContextAwareHostname(new URL("https://deno.land/")));
  },
};

export const check_single_slash_path_context_rewrites = {
  name: "check_single_slash_path_context_rewrites",
  fn() {
    assertEquals(
      rewriteContextualizedURL(
        new URL("http://denosrc/deno.land/std@0.82.0/testing/asserts.ts"),
      ),
      "https://deno.land/std@0.82.0/testing/asserts.ts",
    );
  },
};

export const check_double_slash_path_context_rewrites = {
  name: "check_double_slash_path_context_rewrites",
  fn() {
    assertEquals(
      rewriteContextualizedURL(
        new URL(
          "http://denosrc//http://deno.land/std@0.82.0/testing/asserts.ts",
        ),
      ),
      "http://deno.land/std@0.82.0/testing/asserts.ts",
    );

    assertEquals(
      rewriteContextualizedURL(
        new URL(
          "http://denosrc//https://deno.land/std@0.82.0/testing/asserts.ts",
        ),
      ),
      "https://deno.land/std@0.82.0/testing/asserts.ts",
    );
  },
};

export const check_slash_only_path_context_rewrites = {
  name: "check_slash_only_path_context_rewrites",
  fn() {
    assertEquals(
      rewriteContextualizedURL(
        new URL(
          "http://denosrc/",
        ),
      ),
      "",
    );

    assertEquals(
      rewriteContextualizedURL(
        new URL(
          "http://denosrc////////////////",
        ),
      ),
      "",
    );
  },
};

export const check_other_path_slash_count_context_rewrites = {
  name: "check_other_path_slash_count_context_rewrites",
  fn() {
    assertEquals(
      rewriteContextualizedURL(
        new URL(
          "http://denosrc////////////////deno.land",
        ),
      ),
      "http://denosrc////////////////deno.land",
    );
  },
};
