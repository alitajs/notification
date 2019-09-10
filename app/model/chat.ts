import { extendsModel } from '@/utils';
import { DefineModel } from '@/utils/types';
import { Application } from 'egg';
import { CHAR, INTEGER, Instance } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Chat {
  accountId: string;
  chatId: string;
  maxMsgId: number;
  readMsgId: number;
  /**
   * account type
   */
  type: number | null;
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
      type: INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    readMsgId: {
      type: INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: INTEGER.UNSIGNED,
      defaultValue: null,
    },
  },
  Sample: {
    accountId: 'abcdefghijklmnopqr',
    chatId: 'abcdefghijklmnopqrstuv',
    maxMsgId: 0,
    readMsgId: 0,
    type: null,
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
          readMsgId:
            type: number
            isSchema: true
            limitation:
              - integer: []
              - min: 0
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
  const ChatModel = app.model.define<Instance<Chat>, Chat>('Chat', DefineChat.Attr, {
    indexes: [
      { name: 'PrimaryKey', unique: true, fields: ['chatId', 'accountId'] },
      { name: 'accountIdIndex', fields: ['accountId'] },
    ],
  });
  ChatModel.removeAttribute('id');
  return extendsModel(ChatModel);
};
