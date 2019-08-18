import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, INTEGER, Instance, STRING, TEXT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface MsgRepo {
  chatId: string;
  content: string;
  createAccountId: string;
  deDuplicate: string;
  msgId: number;
}

// TODO: primary key
export const DefineChat: DefineModel<MsgRepo> = {
  Attr: {
    chatId: {
      type: CHAR(22),
      allowNull: false,
    },
    content: {
      type: TEXT,
      allowNull: false,
      defaultValue: '',
    },
    createAccountId: {
      type: CHAR(18),
      allowNull: false,
    },
    deDuplicate: {
      type: STRING(6),
      allowNull: false,
    },
    msgId: {
      type: INTEGER,
      allowNull: false,
    },
  },
  Sample: {
    chatId: 'abcdefghijklmnopqrstuv',
    content: '',
    createAccountId: 'abcdefghijklmnopqr',
    deDuplicate: '',
    msgId: 0,
  },
  Validator: yamlJoi(`
    type: object
    isSchema: true
    limitation:
      - keys:
          chatId:
            type: string
            isSchema: true
            limitation:
              - length: 22
              - token: []
          content:
            type: string
            isSchema: true
            limitation:
              - max: 65535
          createAccountId:
            type: string
            isSchema: true
            limitation:
              - length: 18
              - token: []
          deDuplicate:
            type: string
            isSchema: true
            limitation:
              - max: 6
              - token: []
          msgId:
            type: number
            isSchema: true
            limitation:
              - integer: []
              - min: 0
    `),
};

export default (app: Application) =>
  app.model.define<Instance<MsgRepo>, MsgRepo>('MsgRepo', DefineChat.Attr);
