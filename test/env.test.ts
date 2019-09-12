import 'mocha';
import 'tsconfig-paths/register';

import extendApp from '@/extend/application';
import { Env } from '@/utils/types';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('test env', () => {
  it('test extend.app.noop', () => {
    assert.strictEqual(extendApp.noop(), undefined);
    assert.strictEqual(extendApp.redis, null);
    assert.strictEqual(extendApp.redis, null);
  });

  it('is unit test', () => {
    assert.strictEqual(process.env.NODE_ENV, 'test');
    assert.strictEqual(process.env.EGG_SERVER_ENV, 'unittest');
  });

  it('test app.isEnv', () => {
    assert(app.isEnv(Env.Test));
    assert(!app.isEnv(Env.Dev));
    assert(!app.isEnv(Env.Production));
  });
});

describe('test app config', () => {
  it('redis prefix', () => {
    assert(!!app.config.redis);
    assert(app.config.redis.prefix.endsWith('_test:'));
  });

  it('mysql database', () => {
    assert(
      !!app.config.sequelize &&
        'database' in app.config.sequelize &&
        !!app.config.sequelize.database &&
        app.config.sequelize.database.endsWith('_test'),
    );
  });
});
