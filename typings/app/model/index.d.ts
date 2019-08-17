// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportSecret from '../../../app/model/secret';

declare module 'egg' {
  interface IModel {
    Secret: ReturnType<typeof ExportSecret>;
  }
}
