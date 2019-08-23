import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, Instance } from 'sequelize';
import yamlJoi from 'yaml-joi';
import { DefineMsgrepo, Msgrepo } from './msgrepo';

export interface Msgsync extends Msgrepo {
  recipientId: string;
}

export const DefineMsgsync: DefineModel<Msgsync> = {
  Attr: {
    ...DefineMsgrepo.Attr,
    recipientId: {
      type: CHAR(18),
      allowNull: false,
    },
  },
  Sample: {
    ...DefineMsgrepo.Sample,
    recipientId: 'abcdefghijklmnopqr',
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
            type: number
            isSchema: true
            allowEmpty: "null"
            limitation:
              - integer: []
              - min: 0
    `),
};

export default (app: Application) =>
  app.model.define<Instance<Msgsync>, Msgsync>('Msgsync', DefineMsgsync.Attr, {
    // use index `receivedMsg` in mysql event:
    // DELETE FROM `Msgsync` WHERE `recipientId` > '' AND `creationTime` < 1234567890000;
    indexes: [
      { name: 'receivedMsg', fields: ['recipientId', 'creationTime'] },
      { name: 'PrimaryKey', unique: true, fields: ['recipientId', 'chatId', 'msgId'] },
    ],
  });
