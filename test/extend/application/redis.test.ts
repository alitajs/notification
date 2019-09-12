import 'mocha';
import 'tsconfig-paths/register';

import { SUUID } from '@/utils';
import assert from 'assert';
import { app } from 'egg-mock/bootstrap';
import { RedisClient } from 'redis';
import { promisify } from 'util';

describe('test extend.app.redis', () => {
  beforeEach(async () => {
    /** ensure extend.application works */
    await app.hook.onAppReady.wait(app);
  });

  it('api exists', async () => {
    assert(!!app.redis);
    assert(app.redis.$ instanceof RedisClient);
  });

  it('basic commands', async () => {
    const [key, value] = [SUUID(), SUUID()];
    assert.strictEqual(await app.redis.set(key, value), 'OK');
    assert.strictEqual(await app.redis.get(key), value);
    assert.strictEqual(await app.redis.del(key), 1);
    assert.strictEqual(await app.redis.get(key), null);
  });

  it('batch', async () => {
    const [key, value] = [SUUID(), SUUID()];
    const batch = app.redis.$.batch();
    batch.get(key);
    batch.set(key, value);
    let result = await promisify(batch.exec.bind(batch))();
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], null);
    assert.strictEqual(result[1], 'OK');
    batch.get(key);
    batch.del(key);
    batch.get(key);
    result = await promisify(batch.exec.bind(batch))();
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0], value);
    assert.strictEqual(result[1], 1);
    assert.strictEqual(result[2], null);
  });

  it('lua script', async () => {
    let [key, value] = [SUUID(), 3];
    assert.strictEqual(await app.redis.incrx([key]), 0);
    assert.strictEqual(await app.redis.incrsetnx([key], value), ++value);
    await app.redis.script('FLUSH');
    assert.strictEqual(await app.redis.incrx([key], 0), 1);
    await app.redis.del(key);
  });
});
