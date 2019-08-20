// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportChat from '../../../app/service/chat';
import ExportMsg from '../../../app/service/msg';
import ExportSpread from '../../../app/service/spread';

declare module 'egg' {
  interface IService {
    chat: ExportChat;
    msg: ExportMsg;
    spread: ExportSpread;
  }
}
