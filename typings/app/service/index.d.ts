// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportChat from '../../../app/service/chat';

declare module 'egg' {
  interface IService {
    chat: ExportChat;
  }
}
