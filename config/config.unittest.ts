import { ChoreConfig } from '@/middleware/chore';
import { EggAppConfig, PowerPartial } from 'egg';
import { ClientOpts as RedisOpts } from 'redis';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    // ref: https://github.com/eggjs/egg-sequelize
    sequelize: {
      dialect: 'mysql', // support: mysql, postgres, mssql
      database: 'notification_test',
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
        freezeTableName: true,
      },
    },
    redis: {
      prefix: 'notification_test:',
    } as RedisOpts,
    chore: {
      defaultAccountId: ctx => ctx.request.get('X-Account-Id'),
    } as ChoreConfig,
  };
  return config;
};
