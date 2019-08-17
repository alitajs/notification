import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import path from 'path';

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {
    // ref: https://github.com/eggjs/egg-sequelize
    sequelize: {
      dialect: 'mysql', // support: mysql, postgres, mssql
      database: 'appname',
      host: '127.0.0.1',
      port: 3306,
      username: 'port',
      password: 'port',
      // delegate: 'myModel', // load all models to `app[delegate]` and `ctx[delegate]`, default to `model`
      // baseDir: 'my_model', // load all files in `app/${baseDir}` as models, default to `model`
      // exclude: 'index.ts', // ignore `app/${baseDir}/index.js` when load models, support glob and array
      operatorsAliases: false,
      omitNull: true,
      define: {
        timestamps: false,
        underscored: false,
        freezeTableName: false,
      },
    },
    logger: {
      dir: path.join(appInfo.HOME, 'logs', appInfo.name),
    },
  };
  return config;
};
