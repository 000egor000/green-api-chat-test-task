import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserError } from '../utils';
import { useAsyncAction } from './useAsyncAction';

describe('useAsyncAction', () => {
  it('выставляет pending на время выполнения', async () => {
    let resolve = () => {};
    const { result } = renderHook(() => useAsyncAction(() => new Promise<void>((r) => (resolve = r)), 'fallback'));

    let run: Promise<void> = Promise.resolve();
    act(() => {
      run = result.current.run();
    });
    expect(result.current.pending).toBe(true);
    await act(async () => {
      resolve();
      await run;
    });
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('показывает текст пользовательской ошибки', async () => {
    const { result } = renderHook(() => useAsyncAction(() => Promise.reject(new UserError('плохо')), 'fallback'));
    await act(() => result.current.run());
    expect(result.current.error).toBe('плохо');
  });

  it('скрывает технические ошибки за запасным текстом', async () => {
    const { result } = renderHook(() => useAsyncAction(() => Promise.reject(new TypeError('Invalid URL')), 'fallback'));
    await act(() => result.current.run());
    expect(result.current.error).toBe('fallback');
  });

  it('сбрасывает ошибку', async () => {
    const { result } = renderHook(() => useAsyncAction(() => Promise.reject(new UserError('плохо')), 'fallback'));
    await act(() => result.current.run());
    act(() => result.current.resetError());
    expect(result.current.error).toBe('');
  });
});
