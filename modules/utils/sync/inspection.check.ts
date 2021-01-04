import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";
import { inspection } from "./mod.ts";

const coinflip = () => Math.random() > 0.5;

export const check_inpection = {
  name: "check_inpection",
  async fn() {
    function chaos() {
      if (coinflip()) return "resolve";
      else throw "reject";
    }

    const endless = Promise.race([]);
    const settling = Promise.resolve()
      .then(chaos, chaos)
      .then(chaos, chaos)
      .then(chaos, chaos)
      .catch(chaos)
      .then(chaos, chaos)
      .then(chaos, chaos)
      .then(chaos, chaos)
      .finally(chaos)
      .then(chaos, chaos)
      .then(chaos, chaos)
      .then(chaos, chaos);

    settling.catch(function ignore() {});

    await new Promise((resolve) => setTimeout(resolve));

    const settled = settling;

    assertEquals(await inspection("non-promise"), true);
    assertEquals(await inspection(Promise.resolve("immediate")), true);
    assertEquals(await inspection(Promise.reject("immediate")), false);

    assertEquals(await inspection(endless), undefined);
    assertEquals(
      await inspection(new Promise((resolve) => setTimeout(resolve, 0))),
      undefined,
    );

    assertEquals(typeof await inspection(settled), "boolean");
  },
};
