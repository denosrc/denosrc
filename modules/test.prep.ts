export function perform<Env = object>(this: Env, checks: object) {
  Object.entries(checks).forEach(
    ([name, maybeCheck]) => {
      const { fn } = maybeCheck ?? {};

      if (typeof fn !== "function") {
        return;
      }

      Deno.test(name, () => {
        const maybeEventually = fn.call(this);

        return maybeEventually === undefined
          ? undefined
          : Promise.resolve(maybeEventually).then(function cleanup() {
            return undefined;
          });
      });
    },
  );
}
