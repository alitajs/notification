import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, INTEGER, Instance } from 'sequelize';
import yamlJoi from 'yaml-joi';

// TODO: chat admin
export interface Chat {
  accountId: string;
  chatId: string;
  maxMsgId: number;
  readedMsgId: number;
}

export const DefineChat: DefineModel<Chat> = {
  Attr: {
    accountId: {
      type: CHAR(18),
      allowNull: false,
    },
    chatId: {
      type: CHAR(22),
      allowNull: false,
    },
    maxMsgId: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    readedMsgId: {
      type: INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  Sample: {
    accountId: 'abcdefghijklmnopqr',
    chatId: 'abcdefghijklmnopqrstuv',
    maxMsgId: 0,
    readedMsgId: 0,
  },
  Validator: yamlJoi(`
    type: object
    isSchema: true
    limitation:
      - keys:
          accountId:
            type: string
            isSchema: true
            limitation:
              - length: 18
              - token: []
          chatId:
            type: string
            isSchema: true
            limitation:
              - length: 22
              - token: []
          maxMsgId:
            type: number
            isSchema: true
            limitation:
              - integer: []
              - min: 0
          readedMsgId:
            type: number
            isSchema: true
            limitation:
              - integer: []
              - min: 0
    `),
};

export default (app: Application) =>
  app.model.define<Instance<Chat>, Chat>('Chat', DefineChat.Attr, {
    indexes: [
      { name: 'accountIdIndex', fields: ['accountId'] },
      { name: 'chatIdIndex', fields: ['chatId'] },
    ],
  });
