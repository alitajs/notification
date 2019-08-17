import path from 'path';
import { IOptions as GlobOptions, sync as globSync } from 'glob';

export type MatchString =
  | string
  | RegExp
  | (string | RegExp)[]
  | ((str: string) => boolean)
  | { include?: MatchString; exclude?: MatchString };

export function matchString(config: MatchString, str: string): boolean {
  if (!config) return true;
  if (typeof config === 'string') return config === str;
  if (config instanceof RegExp) return config.test(str);
  if (Array.isArray(config)) return config.some(item => matchString(item, str));
  if (typeof config === 'function') return config(str);
  const include = !config.include || matchString(config.include, str);
  const exclude = config.exclude && matchString(config.exclude, str);
  return include && !exclude;
}

export type MatchFiles = string | [string, GlobOptions] | (string | [string, GlobOptions])[];

/**
 * @param from search files from absolute path
 */
export function matchFiles(config: MatchFiles, from: string): string[] {
  if (typeof config === 'string') {
    if (!path.isAbsolute(config)) {
      config = path.join(from, config);
    }
    return globSync(config, { nodir: true });
  }
  /**
   * not `[string, GlobOptions]`
   */
  if (
    config.length !== 2 ||
    typeof config[0] !== 'string' ||
    typeof config[1] === 'string' ||
    Array.isArray(config[1])
  ) {
    return (config as (string | [string, GlobOptions])[]).reduce<string[]>((prev, curr) => {
      return prev.concat(matchFiles(curr, from));
    }, []);
  }
  if (!path.isAbsolute(config[0])) {
    config[0] = path.join(from, config[0]);
  }
  return globSync(config[0], config[1] as GlobOptions);
}

export function matchAbsPath<T>(source: string | T, ...base: string[]): string | T {
  return typeof source !== 'string' || path.isAbsolute(source)
    ? source
    : path.join(...base, source);
}

export function matchObjAbsPaths<O extends object>(
  obj: O,
  keys: (keyof O)[],
  ...base: string[]
): void {
  keys.forEach(key => (obj[key] = matchAbsPath(obj[key], ...base) as O[typeof key]));
}
