import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, INTEGER, Instance, STRING, TEXT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Msgsync {
  chatId: string;
  content: string;
  createTime: number;
  deDuplicate: string;
  msgId: number;
  recipientId: string;
  senderId: string;
  type: string | null;
}

export const DefineMsgsync: DefineModel<Msgsync> = {
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
    recipientId: {
      type: CHAR(18),
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
    recipientId: 'abcdefghijklmnopqr',
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
          recipientId:
            type: string
            isSchema: true
            limitation:
              - length: 18
              - token: []
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
  app.model.define<Instance<Msgsync>, Msgsync>('Msgsync', DefineMsgsync.Attr, {
    // use index `receivedMsg` in mysql event:
    // DELETE FROM `Msgsync` WHERE `recipientId` <> NULL AND `createTime` < 1234567890000;
    indexes: [{ name: 'receivedMsg', fields: ['recipientId', 'createTime'] }],
  });
