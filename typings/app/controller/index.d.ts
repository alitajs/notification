// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/controller/account';

declare module 'egg' {
  interface IController {
    account: ExportAccount;
  }
}
