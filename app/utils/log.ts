import { writeFile } from 'fs';

export function writeInspect(path: string, conifg: object) {
  const time = `${new Date()}`;
  writeFile(path, JSON.stringify({ time, ...conifg }, null, 2), () => void 0);
}
