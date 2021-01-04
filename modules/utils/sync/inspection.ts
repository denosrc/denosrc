export type Outcome = true | false | undefined;

export const passed = () => true;
export const failed = () => false;
export const undecided = () => undefined;

const microtask = Promise.resolve(undecided());

export default inspection;
export function inspection(value: any) {
  return Promise.any(
    [Promise.resolve(value).then(passed, failed), microtask.finally(undecided)],
  );
}

export const refuse = <Reason>(reason: Reason) => {
  throw reason;
};

export type Investigator<Future> = AsyncGenerator<any, Future, Outcome>;

export function investigate<Future>(gen: Investigator<Future>, clue: Outcome) {
  return reveal(clue);

  function reveal(hint: Outcome): Promise<Future> {
    return gen.next(hint).then(listen);
  }

  function listen(it: IteratorResult<any, Future>) {
    if (it.done) return it.value;
    else return inspection(it.value).then(reveal);
  }
}

function investigative<
  Future,
  Investigates extends
    | ((...args: any[]) => Investigator<Future>)
    | ((this: any, ...args: any[]) => Investigator<Future>),
>(fn: Investigates): Investigates {
  return function (this: ThisParameterType<Investigates>) {
    const gen = fn.apply(this, arguments as any);

    return investigate(gen, undefined);
  } as any; // TODO: obviate this type assertion
}
