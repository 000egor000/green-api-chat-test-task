import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sleep } from './sleep';

describe('sleep', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('завершается по таймеру', async () => {
    const done = vi.fn();
    sleep(1000, new AbortController().signal).then(done);
    await vi.advanceTimersByTimeAsync(999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
  });

  it('завершается сразу при отмене и снимает слушатель', async () => {
    const controller = new AbortController();
    const removeSpy = vi.spyOn(controller.signal, 'removeEventListener');
    const promise = sleep(10_000, controller.signal);
    controller.abort();
    await expect(promise).resolves.toBeUndefined();
    expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
