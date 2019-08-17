// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuth from '../../../app/service/auth';

declare module 'egg' {
  interface IService {
    auth: ExportAuth;
  }
}
