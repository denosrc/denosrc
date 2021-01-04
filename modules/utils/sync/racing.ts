export type Immediate<Value> = Value extends Promise<infer Future> ? Future
  : Value;
export type Eventual<Future> = Future extends Promise<infer Value>
  ? Value | Future
  : Future | Promise<Future>;

export type Lane<Venue, Future, Thrown> = {
  future: Eventual<Future>;
  resolve?:
    | null
    | undefined
    | ((comp: Competition<Venue, Future>) => Eventual<never>)
    | ((comp: Competition<Venue, Future>) => Eventual<Future>);
  reject?:
    | null
    | undefined
    | ((comp: Competition<Venue, Thrown>) => Eventual<never>)
    | ((comp: Competition<Venue, Thrown>) => Eventual<Future>);
};

export type Competition<Venue, Future> = {
  context: Venue;
  id: keyof any;
  label: string;
  quit: <Throws>(err?: Throws) => never;
  future: Eventual<Future>;
  value: Future;
  done: boolean;
};

export const competing = <Venue, Future>(
  comp: any,
  racer?: Eventual<Future>,
): comp is Competition<Venue, Immediate<Future>> => {
  if (!comp) return false;
  else if (racer !== comp.future) return false;
  else if (typeof comp.done !== "boolean") return false;
  else if (comp.quit !== quit) return false;
  else if (typeof comp.label !== "string") return false;
  else if (!/string|symbol|number/.test(typeof comp.id)) return false;
  else return true;
};

type Seeder<Track> =
  | ((keys: (keyof Track)[], track: Track) => typeof keys)
  | ((keys: (keyof Track)[], track: Track) => Sorter<keyof Track>);

type Sorter<Value> = (cmp: Value, ref: Value) => number;

export const endless = Promise.race([]);
export const quit = <Reason>(reason?: Reason) => {
  throw reason;
};

export function racing<
  Context,
  Futures extends { [Key in keyof Futures]: Futures[Key] },
  Track extends { [Key in keyof Futures]?: Lane<Context, Futures[Key], any> },
  Priorities extends (keyof Track)[],
>(
  context: Context,
  ...seeding: [
    ...Priorities,
    & { [Key in keyof Futures]?: Lane<Context, Futures[Key], any> }
    & Track,
  ]
): { [Key in keyof Futures]: Promise<Immediate<Futures[Key]>> }[
  {
    [Key in keyof Futures]: Track[Key] extends {} ? (Track[Key] extends {
      resolve: null | ((value: any) => never);
      reject?: null | ((value: any) => never) | undefined;
    } ? never
      : Key)
      : never;
  }[keyof Futures]
] {
  // TODO: fix these types...
  const lanes = seeding.pop() as Track;
  const priorities = seeding as (keyof Track)[];
  const keys = lanes ? Object.keys(lanes) as (keyof typeof lanes)[] : [];

  const racers = priorities.concat(keys).reduce((all, id) => {
    if (!lanes[id] || all.has(id)) return all;

    const { future, resolve = true, reject = true } = lanes[id]!;
    const label = String(context ?? "") + id;

    const next = Promise.resolve(future as Immediate<typeof future>)
      .then((value) => {
        const done = true;
        const comp = { context, id, label, done, value, future, quit } as any; // TODO: obviate this type assertion

        if (typeof resolve === "function") {
          // should pair well with locally scoped "state-machinery" (esp. when throwing)
          return resolve(comp) as Immediate<ReturnType<typeof resolve>>;
        } else if (resolve) return value;
        else throw comp;
      }, (value) => {
        const comp = { context, id, label, done: false, value, future, quit };

        if (typeof reject === "function") {
          // should pair well with locally scoped "state-machinery" (esp. when throwing)
          return reject(comp) as Immediate<ReturnType<typeof reject>>;
        } else if (reject) throw comp;
        else return endless;
      });

    return all.set(id, next);
  }, new Map());

  return Promise.race(racers.values()) as any; // TODO: improve typing...
}
