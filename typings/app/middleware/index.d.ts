// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportChore from '../../../app/middleware/chore';
import ExportErrorcode from '../../../app/middleware/errorcode';
import ExportParser from '../../../app/middleware/parser';

declare module 'egg' {
  interface IMiddleware {
    chore: typeof ExportChore;
    errorcode: typeof ExportErrorcode;
    parser: typeof ExportParser;
  }
}
