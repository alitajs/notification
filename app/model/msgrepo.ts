import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, INTEGER, Instance, STRING, TEXT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Msgrepo {
  chatId: string;
  content: string;
  createTime: number;
  deDuplicate: string;
  msgId: number;
  senderId: string;
  type: number | null;
}

// TODO: check the usage of indexes (created by primary key) with sequelize
export const DefineMsgrepo: DefineModel<Msgrepo> = {
  Attr: {
    chatId: {
      type: CHAR(22),
      allowNull: false,
    },
    content: {
      type: TEXT,
      allowNull: false,
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
      type: INTEGER,
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
              - allow: ""
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
              - allow: ""
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
            type: number
            isSchema: true
            allowEmpty: "null"
            limitation:
              - integer: []
              - min: 0
    `),
};

export default (app: Application) =>
  app.model.define<Instance<Msgrepo>, Msgrepo>('Msgrepo', DefineMsgrepo.Attr, {
    indexes: [
      { name: 'PrimaryKey', unique: true, fields: ['chatId', 'msgId'] },
      { name: 'msgCreateTime', fields: ['chatId', 'createTime'] },
      // { name: 'msgCreateTime', fields: ['chatId', 'createTime', 'deDuplicate'], unique: true },
    ],
  });
