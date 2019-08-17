export interface Hook<T extends any[] = any[]> {
  /**
   * @param cbk
   * Add call back to this hooks.
   * Return `true` will not delete this call back after call
   */
  (...cbk: ((...args: T) => boolean | void)[]): number;
  queue: ((...args: T) => boolean | void)[];
  run: (...args: T) => void;
}

export const createHook = <T extends any[]>(): Hook<T> => {
  const hook: Hook<T> = (...args) => hook.queue.push(...args);
  hook.queue = [] as ((...args: T) => boolean | void)[];
  hook.run = (...args: T) => (hook.queue = hook.queue.filter(cbk => cbk(...args)));
  return hook;
};
