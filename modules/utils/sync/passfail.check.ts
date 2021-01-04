import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";
import { inspection, passfail } from "./mod.ts";

export const check_passfail = {
  name: "check_passfail",
  async fn() {
    const [future, resolve, reject] = passfail();
    const [other, ace, flunk] = passfail();

    assertEquals(await inspection(future), undefined);
    assertEquals(await inspection(other), undefined);

    resolve(123);
    flunk("abc");

    assertEquals(await inspection(future), true);
    assertEquals(await inspection(other), false);

    reject(789);
    ace("xyz");

    assertEquals(await inspection(future), true);
    assertEquals(await inspection(other), false);

    await future;
    await other.catch(function ignore() {});

    assertEquals(await inspection(future), true);
    assertEquals(await inspection(other), false);
  },
};
