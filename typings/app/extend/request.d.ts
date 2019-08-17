// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExtendRequest from '../../../app/extend/request';
type ExtendRequestType = typeof ExtendRequest;
declare module 'egg' {
  interface Request extends ExtendRequestType {}
}
