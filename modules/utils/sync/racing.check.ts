import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";
import { racing } from "./mod.ts";

export const check_racing = {
  name: "check_racing",
  async fn() {
    assertEquals(
      "immediate:passed",
      await racing({ title: "context" }, {
        fast: { future: Promise.resolve("immediate") },
        slow: {
          future: new Promise((resolve) => setTimeout(resolve)).then(() =>
            "eventual"
          ),
        },
      }).then(
        (winning) => winning + ":passed",
        ({ value }) => String(value) + ":failed",
      ),
    );

    assertEquals(
      "immediate:failed",
      await (racing({ title: "context" }, {
        fast: { future: Promise.reject("immediate") },
        slow: {
          future: new Promise((resolve) => setTimeout(resolve)).then(() =>
            "eventual"
          ),
        },
      }) as any).then( // TODO: fix typing
        (winning: string) => winning + ":passed",
        ({ value }: any) => String(value) + ":failed",
      ),
    );
    
    assertEquals(
      "eventual:passed",
      await (racing({ title: "context" }, {
        fast: { future: Promise.reject("immediate"), reject: null },
        slow: {
          future: new Promise((resolve) => setTimeout(resolve)).then(() =>
            "eventual"
          ),
        },
      }) as any).then( // TODO: fix typing
        (winning: string) => winning + ":passed",
        ({ value }: any) => String(value) + ":failed",
      ),
    );
    
    assertEquals(
      "eventual:failed",
      await (racing({ title: "context" }, {
        fast: { future: Promise.reject("immediate"), reject: null },
        slow: {
          resolve: null,
          future: new Promise((resolve) => setTimeout(resolve)).then(() =>
            "eventual"
          ),
        },
      }) as any).then( // TODO: fix typing
        (winning: string) => winning + ":passed",
        ({ value }: any) => String(value) + ":failed",
      ),
    );
    
  },
};
