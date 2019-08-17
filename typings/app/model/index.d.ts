// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportChat from '../../../app/model/chat';

declare module 'egg' {
  interface IModel {
    Chat: ReturnType<typeof ExportChat>;
  }
}
