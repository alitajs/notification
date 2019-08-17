import { DefineAttributeColumnOptions } from 'sequelize';
import { omit } from 'lodash';

export type ModelShema<T extends object> = { [K in keyof T]-?: DefineAttributeColumnOptions };

export const omitModelFieldsName = ['autoIncrement', 'field', 'primaryKey'] as const;
export const omitModelField = (field: DefineAttributeColumnOptions) =>
  omit(field, omitModelFieldsName);
