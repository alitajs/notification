export interface Hook<T extends any[] = any[]> {
  /**
   * @param cbk
   * Add call back to this hooks.
   * Return `true` will not delete this call back after call
   */
  (...cbk: ((...args: T) => boolean | void | Promise<boolean | void>)[]): number;
  queue: ((...args: T) => boolean | void | Promise<boolean | void>)[];
  exec: (...args: T) => void;
  safeExec: (...args: T) => void;
  safeWait: (...args: T) => Promise<void>;
  wait: (...args: T) => Promise<void>;
}

export const createHook = <T extends any[]>(): Hook<T> => {
  const hook: Hook<T> = (...args) => hook.queue.push(...args);
  hook.queue = [] as ((...args: T) => boolean | void)[];
  hook.exec = (...args: T) => {
    const queue: Hook<T>['queue'] = [];
    for (const cbk of hook.queue) {
      if (cbk(...args) === true) {
        queue.push(cbk);
      }
    }
    hook.queue = queue;
  };
  hook.safeExec = (...args: T) => {
    const queue: Hook<T>['queue'] = [];
    for (const cbk of hook.queue) {
      try {
        if (cbk(...args) === true) {
          queue.push(cbk);
        }
      } catch {}
    }
    hook.queue = queue;
  };
  hook.safeWait = async (...args: T) => {
    const queue: Hook<T>['queue'] = [];
    for (const cbk of hook.queue) {
      try {
        if ((await cbk(...args)) === true) {
          queue.push(cbk);
        }
      } catch {}
    }
    hook.queue = queue;
  };
  hook.wait = async (...args: T) => {
    const queue: Hook<T>['queue'] = [];
    for (const cbk of hook.queue) {
      if ((await cbk(...args)) === true) {
        queue.push(cbk);
      }
    }
    hook.queue = queue;
  };
  return hook;
};
