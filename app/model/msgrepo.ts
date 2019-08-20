import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, INTEGER, Instance, STRING, TEXT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface MsgRepo {
  chatId: string;
  content: string;
  createTime: number;
  deDuplicate: string;
  msgId: number;
  senderId: string;
  type: string | null;
}

// TODO: check the usage of indexes (created by primary key) with sequelize
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
    createTime: {
      type: INTEGER,
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
    senderId: {
      type: CHAR(18),
      allowNull: false,
    },
    type: {
      type: STRING(16),
    },
  },
  Sample: {
    chatId: 'abcdefghijklmnopqrstuv',
    content: '',
    createTime: 0,
    deDuplicate: '',
    msgId: 0,
    senderId: 'abcdefghijklmnopqr',
    type: null,
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
          createTime:
            type: number
            isSchema: true
            limitation:
              - integer: []
              - min: 0
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
          senderId:
            type: string
            isSchema: true
            limitation:
              - length: 18
              - token: []
          type:
            type: string
            isSchema: true
            allowEmpty: "null"
            limitation:
              - max: 16
    `),
};

export default (app: Application) =>
  app.model.define<Instance<MsgRepo>, MsgRepo>('MsgRepo', DefineChat.Attr, {
    indexes: [
      { name: 'PrimaryKey', unique: true, fields: ['chatId', 'msgId'] },
      { name: 'msgCreateTime', fields: ['chatId', 'createTime'] },
      // { name: 'msgCreateTime', fields: ['chatId', 'createTime', 'deDuplicate'], unique: true },
    ],
  });
