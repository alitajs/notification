// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAdmin from '../../../app/controller/admin';
import ExportChat from '../../../app/controller/chat';

declare module 'egg' {
  interface IController {
    admin: ExportAdmin;
    chat: ExportChat;
  }
}
