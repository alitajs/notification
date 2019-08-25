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

  export interface Model {
    /**
     * Update multiple instances that match the where options. The promise returns an array with one or two
     * elements. The first element is always the number of affected rows, while the second element is the actual
     * affected rows (only supported in postgres with `options.returning` true.)
     */
    updateEvenIfEmpty(
      values: Partial<TAttributes>,
      options?: UpdateOptions,
    ): Promise<[number, TInstance[]]>;
  }

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
