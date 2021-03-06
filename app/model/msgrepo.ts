import { extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { BIGINT, CHAR, INTEGER, Instance, STRING, TEXT } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Msgrepo {
  chatId: string;
  content: string;
  creationTime: number;
  deDuplicate: string;
  msgId: number;
  senderId: string;
  type: number | null;
}

// check the usage of indexes in sequelize
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
    creationTime: {
      type: BIGINT,
      allowNull: false,
    },
    deDuplicate: {
      type: STRING(12),
      allowNull: false,
    },
    msgId: {
      type: INTEGER.UNSIGNED,
      allowNull: false,
    },
    senderId: {
      type: CHAR(18),
      allowNull: false,
    },
    type: {
      type: INTEGER.UNSIGNED,
    },
  },
  Sample: {
    chatId: 'abcdefghijklmnopqrstuv',
    content: '',
    creationTime: 0,
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
          creationTime:
            type: number
            isSchema: true
            limitation:
              - integer: []
              - min: 0
          deDuplicate:
            type: string
            isSchema: true
            limitation:
              - max: 12
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

export default (app: Application) => {
  const MsgrepoModel = app.model.define<Instance<Msgrepo>, Msgrepo>('Msgrepo', DefineMsgrepo.Attr, {
    indexes: [
      { name: 'PrimaryKey', unique: true, fields: ['chatId', 'msgId'] },
      { name: 'msgCreationTime', fields: ['chatId', 'creationTime'] },
      // { name: 'msgCreationTime', fields: ['chatId', 'creationTime', 'deDuplicate'], unique: true },
    ],
  });
  MsgrepoModel.removeAttribute('id');
  return extendsModel(MsgrepoModel);
};
