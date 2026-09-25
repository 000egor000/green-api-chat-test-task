import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteNotification, GreenApiError, receiveNotification } from '../api';
import { useNotifications } from './useNotifications';

vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  receiveNotification: vi.fn(),
  deleteNotification: vi.fn(),
}));

type Received = Awaited<ReturnType<typeof receiveNotification>>;

const receiveMock = vi.mocked(receiveNotification);
const deleteMock = vi.mocked(deleteNotification);
const creds = { idInstance: '1', apiTokenInstance: 't', apiUrl: 'https://x' };

const hangUntilAbort = (_: unknown, __: unknown, signal: AbortSignal) =>
  new Promise<never>((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('', 'AbortError'))));

function queue(...items: (Received | Error)[]) {
  items.forEach((item) =>
    receiveMock.mockImplementationOnce(async () => {
      if (item instanceof Error) throw item;
      return item;
    }),
  );
  receiveMock.mockImplementation(hangUntilAbort);
}

describe('useNotifications', () => {
  beforeEach(() => {
    receiveMock.mockReset();
    deleteMock.mockReset().mockResolvedValue({ result: true });
  });

  it('передаёт уведомление обработчику и удаляет его из очереди', async () => {
    const body = { typeWebhook: 'incomingMessageReceived' };
    queue(null, { receiptId: 7, body });
    const handler = vi.fn();
    renderHook(() => useNotifications(creds, handler));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(creds, 7, expect.any(AbortSignal)));
    expect(handler).toHaveBeenCalledWith(body);
  });

  it('удаляет уведомление, даже если обработчик упал', async () => {
    queue({ receiptId: 1, body: { typeWebhook: 'x' } });
    renderHook(() =>
      useNotifications(creds, () => {
        throw new Error('boom');
      }),
    );
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(creds, 1, expect.any(AbortSignal)));
  });

  it('пропускает уведомления без receiptId и без body', async () => {
    queue({ body: { typeWebhook: 'x' } }, { receiptId: 2 });
    const handler = vi.fn();
    renderHook(() => useNotifications(creds, handler));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(creds, 2, expect.any(AbortSignal)));
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(handler).not.toHaveBeenCalled();
  });

  it('показывает offline при ошибке и восстанавливается', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    queue(new Error('network'), null);
    const { result } = renderHook(() => useNotifications(creds, vi.fn()));

    await waitFor(() => expect(result.current).toBe('offline'));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    await waitFor(() => expect(result.current).toBe('online'));
    vi.useRealTimers();
  });

  it('останавливает опрос при отказе в доступе', async () => {
    queue(GreenApiError.fromResponse(401));
    const { result } = renderHook(() => useNotifications(creds, vi.fn()));
    await waitFor(() => expect(result.current).toBe('unauthorized'));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receiveMock).toHaveBeenCalledTimes(1);
  });

  it('останавливает опрос, если задан webhookUrl', async () => {
    queue(GreenApiError.fromResponse(400, 'custom webhook url is set'));
    const { result } = renderHook(() => useNotifications(creds, vi.fn()));
    await waitFor(() => expect(result.current).toBe('webhookSet'));
    expect(receiveMock).toHaveBeenCalledTimes(1);
  });

  it('вызывает актуальный обработчик без перезапуска цикла', async () => {
    receiveMock.mockImplementation(hangUntilAbort);
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ handler }) => useNotifications(creds, handler), {
      initialProps: { handler: first },
    });
    await waitFor(() => expect(receiveMock).toHaveBeenCalledTimes(1));
    rerender({ handler: second });
    expect(receiveMock).toHaveBeenCalledTimes(1);
  });

  it('останавливает цикл при размонтировании', async () => {
    receiveMock.mockImplementation(hangUntilAbort);
    const { unmount } = renderHook(() => useNotifications(creds, vi.fn()));
    await waitFor(() => expect(receiveMock).toHaveBeenCalledTimes(1));
    const signal = receiveMock.mock.lastCall?.[2];
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
