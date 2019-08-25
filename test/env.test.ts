import 'mocha';
import 'tsconfig-paths/register';

import assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('test env', () => {
  it('is unit test', () => {
    assert.strictEqual(process.env.NODE_ENV, 'test');
    assert.strictEqual(process.env.EGG_SERVER_ENV, 'unittest');
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
