import 'mocha';
import 'tsconfig-paths/register';

import { createHook } from '@/extend/hook/utils';
import assert from 'assert';

describe('test extend.app.hook', () => {
  it('exec hook', () => {
    const hook = createHook<[boolean]>();
    hook(res => res);
    assert.strictEqual(hook.queue.length, 1);
    hook.exec(true);
    assert.strictEqual(hook.queue.length, 1);
    hook.exec(false);
    assert.strictEqual(hook.queue.length, 0);
  });

  it('safeExec hook', () => {
    const hook = createHook<[boolean | null]>();
    hook(res => {
      if (res === null) throw res;
      return res;
    });
    assert.strictEqual(hook.queue.length, 1);
    assert.throws(() => hook.exec(null));
    assert.doesNotThrow(() => hook.safeExec(null));
    assert.strictEqual(hook.queue.length, 0);
    hook(res => {
      if (res === null) throw res;
      return res;
    });
    assert.strictEqual(hook.queue.length, 1);
    hook.safeExec(true);
    assert.strictEqual(hook.queue.length, 1);
    hook.safeExec(false);
    assert.strictEqual(hook.queue.length, 0);
  });

  it('wait hook', async () => {
    const hook = createHook<[boolean]>();
    hook(async res => res);
    assert.strictEqual(hook.queue.length, 1);
    await hook.wait(true);
    assert.strictEqual(hook.queue.length, 1);
    await hook.wait(false);
    assert.strictEqual(hook.queue.length, 0);
    hook(async res => res);
    assert.strictEqual(hook.queue.length, 1);
    hook.exec(true); // new Promise() !== true
    assert.strictEqual(hook.queue.length, 0);
  });

  it('safeWait hook', async () => {
    const hook = createHook<[boolean | null]>();
    hook(async res => {
      if (res === null) throw res;
      return res;
    });
    assert.strictEqual(hook.queue.length, 1);
    assert.rejects(hook.wait(null));
    await hook.safeWait(null);
    assert.strictEqual(hook.queue.length, 0);
    hook(async res => {
      if (res === null) throw res;
      return res;
    });
    assert.strictEqual(hook.queue.length, 1);
    await hook.safeWait(true);
    assert.strictEqual(hook.queue.length, 1);
    await hook.safeWait(false);
    assert.strictEqual(hook.queue.length, 0);
  });
});
