import { DefineModelAttr } from '@/utils/types';
import { Application } from 'egg';
import { Instance, STRING } from 'sequelize';
import yamlJoi from 'yaml-joi';

export interface Secret {
  secret: string;
  accountId: string;
}

export const SecretAttr: DefineModelAttr<Secret> = {
  accountId: {
    type: STRING(18),
    allowNull: false,
    primaryKey: true,
  },
  secret: {
    type: STRING(22),
    allowNull: false,
  },
};

export const SecretValidExample: Secret = {
  accountId: 'abcdefghijklmnopqr',
  secret: 'abcdefghijklmnopqrstuv',
};

export const SecretValidator = yamlJoi(`
type: object
isSchema: true
limitation:
  - keys:
      accountId:
        type: string
        isSchema: true
        limitation:
          - length: 18
          - regex: !!js/regexp /^(?:[0-9a-zA-Z]*)$/
      secret:
        type: string
        isSchema: true
        limitation:
          - length: 22
          - regex: !!js/regexp /^(?:[0-9a-zA-Z]*)$/
`);

export default (app: Application) =>
  app.model.define<Instance<Secret>, Secret>('Secret', SecretAttr);
