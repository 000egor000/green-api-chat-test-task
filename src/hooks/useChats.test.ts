import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadChats } from '../store';
import { useChats } from './useChats';

describe('useChats', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('сохраняет изменения с задержкой, а не на каждое действие', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useChats('1'));
    act(() => {
      result.current[1]({ type: 'upsertChat', chat: { chatId: 'a' } });
      result.current[1]({ type: 'upsertChat', chat: { chatId: 'b' } });
    });
    setItem.mockClear();
    act(() => vi.advanceTimersByTime(499));
    expect(setItem).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(loadChats('1').map((c) => c.chatId)).toEqual(['b', 'a']);
  });

  it('сохраняет последнее состояние при размонтировании', () => {
    const { result, unmount } = renderHook(() => useChats('1'));
    act(() => result.current[1]({ type: 'upsertChat', chat: { chatId: 'a' } }));
    unmount();
    expect(loadChats('1').map((c) => c.chatId)).toEqual(['a']);
  });

  it('сохраняет при закрытии вкладки', () => {
    const { result } = renderHook(() => useChats('1'));
    act(() => result.current[1]({ type: 'upsertChat', chat: { chatId: 'a' } }));
    window.dispatchEvent(new Event('pagehide'));
    expect(loadChats('1').map((c) => c.chatId)).toEqual(['a']);
  });

  it('восстанавливает сохранённые чаты', () => {
    const first = renderHook(() => useChats('1'));
    act(() => first.result.current[1]({ type: 'upsertChat', chat: { chatId: 'a' } }));
    first.unmount();
    const { result } = renderHook(() => useChats('1'));
    expect(result.current[0].map((c) => c.chatId)).toEqual(['a']);
  });
});
