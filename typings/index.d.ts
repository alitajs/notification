import 'egg';
import { Dictionary } from 'lodash';
import sequelize, { Sequelize } from '@types/sequelize';
import { IncomingHttpHeaders, RequestOptions } from 'urllib';

declare module 'egg' {
  interface CURLResult<T = any> {
    data: T;
    headers: IncomingHttpHeaders & Dictionary<string>;
    status: number;
    [key: string]: any;
  }

  interface Context {
    model: IModel;
    curl<T = any>(url: string, opt?: RequestOptions): Promise<CURLResult<T>>;
  }
  interface Application {
    model: IModel & Sequelize;
  }
}

declare module 'sequelize' {
  export = sequelize;

  // export declare enum IndexHints {
  //   USE = 'USE',
  //   FORCE = 'FORCE',
  //   IGNORE = 'IGNORE',
  // }

  // export interface IndexHintable {
  //   /**
  //    * MySQL only.
  //    */
  //   indexHints?: IndexHint[];
  // }

  // export interface FindOptions extends IndexHintable {}
}
