export function passfail<Resolution>() {
  let passed: (value: Resolution | PromiseLike<Resolution>) => void;
  let failed: (reason?: any) => void;

  const thenable = new Promise<Resolution>((resolve, reject) => {
    passed = resolve;
    failed = reject;
  });

  return [
    thenable,
    passed!,
    failed!,
  ] as [typeof thenable, typeof passed, typeof failed];
}

export function passable<Resolution>() {
  const mutable = passfail<Resolution>();

  mutable.pop(); // NOTE: mutation here

  return mutable as unknown as [typeof mutable[0], typeof mutable[1]];
}

export function failable<Resolution>() {
  const mutable = passfail<Resolution>();

  mutable[0] = mutable[0].then(fails); // NOTE: mutation here

  return mutable as [Promise<never>, typeof mutable[1], typeof mutable[2]];
}

// NOTE: non-arrow function here would emit the wrong type
const fails = <Resolution>(value: Resolution) => {
  throw value;
};
