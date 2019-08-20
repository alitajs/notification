// This file is created by egg-ts-helper@1.25.5
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportChat from '../../../app/model/chat';
import ExportMsgrepo from '../../../app/model/msgrepo';
import ExportMsgsync from '../../../app/model/msgsync';

declare module 'egg' {
  interface IModel {
    Chat: ReturnType<typeof ExportChat>;
    Msgrepo: ReturnType<typeof ExportMsgrepo>;
    Msgsync: ReturnType<typeof ExportMsgsync>;
  }
}
