import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAccount, deleteNotification, GreenApiError, receiveNotification, sendMessage } from '../api';
import { API_ERROR_TEXTS, INSTANCE_STATE_TEXTS, MESSENGER_TEXTS } from '../constants';
import { useMessenger } from './useMessenger';

vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  receiveNotification: vi.fn(),
  deleteNotification: vi.fn(),
  checkAccount: vi.fn(),
  sendMessage: vi.fn(),
}));

type Received = Awaited<ReturnType<typeof receiveNotification>>;

const creds = { idInstance: '1', apiTokenInstance: 't', apiUrl: 'https://x' };
const receiveMock = vi.mocked(receiveNotification);
const sendMock = vi.mocked(sendMessage);

const hangUntilAbort = (_: unknown, __: unknown, signal: AbortSignal) =>
  new Promise<never>((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('', 'AbortError'))));

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

async function openChat() {
  const hook = renderHook(() => useMessenger(creds));
  await act(() => hook.result.current.createChat('79991234567'));
  return hook;
}

describe('useMessenger', () => {
  beforeEach(() => {
    localStorage.clear();
    receiveMock.mockReset().mockImplementation(hangUntilAbort);
    vi.mocked(deleteNotification).mockReset().mockResolvedValue({ result: true });
    vi.mocked(checkAccount).mockReset().mockResolvedValue({ exist: true, chatId: 'c1' });
    sendMock.mockReset();
  });

  it('создаёт чат по номеру и открывает его', async () => {
    const { result } = await openChat();
    expect(result.current.activeChat).toMatchObject({ chatId: 'c1', phone: '79991234567' });
  });

  it('сообщает, что номер не зарегистрирован', async () => {
    vi.mocked(checkAccount).mockResolvedValue({ exist: false, chatId: '' });
    const { result } = renderHook(() => useMessenger(creds));
    await expect(result.current.createChat('79990000000')).rejects.toThrow(MESSENGER_TEXTS.notRegistered);
  });

  it('применяет статус, пришедший раньше ответа sendMessage', async () => {
    const response = deferred<{ idMessage: string }>();
    const status = deferred<Received>();
    sendMock.mockReturnValue(response.promise);
    receiveMock.mockImplementationOnce(() => status.promise).mockImplementation(hangUntilAbort);

    const { result } = await openChat();
    let sending: Promise<void> = Promise.resolve();
    act(() => {
      sending = result.current.send('привет');
    });
    expect(result.current.activeChat?.messages[0]?.status).toBe('pending');

    status.resolve({
      receiptId: 1,
      body: { typeWebhook: 'outgoingMessageStatus', chatId: 'c1', idMessage: 'srv-1', status: 'read' } as never,
    });
    await waitFor(() => expect(deleteNotification).toHaveBeenCalled());

    await act(async () => {
      response.resolve({ idMessage: 'srv-1' });
      await sending;
    });
    expect(result.current.activeChat?.messages[0]).toMatchObject({ id: 'srv-1', status: 'read' });
  });

  it('сохраняет понятную причину ошибки отправки', async () => {
    sendMock.mockRejectedValue(GreenApiError.fromResponse(466));
    const { result } = await openChat();
    await act(() => result.current.send('привет'));
    expect(result.current.activeChat?.messages[0]).toMatchObject({
      status: 'failed',
      error: API_ERROR_TEXTS.quotaExceeded,
    });
  });

  it('входящее в открытый чат не увеличивает счётчик непрочитанных', async () => {
    const incoming = deferred<Received>();
    receiveMock.mockImplementationOnce(() => incoming.promise).mockImplementation(hangUntilAbort);
    const { result } = await openChat();
    incoming.resolve({
      receiptId: 1,
      body: {
        typeWebhook: 'incomingMessageReceived',
        idMessage: 'in-1',
        timestamp: 1,
        senderData: { chatId: 'c1' },
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'ответ' } },
      } as never,
    });
    await waitFor(() => expect(result.current.activeChat?.messages).toHaveLength(1));
    expect(result.current.activeChat?.unread).toBe(0);
  });

  it('не проверяет повторно номер без аккаунта', async () => {
    vi.mocked(checkAccount).mockResolvedValue({ exist: false, chatId: '' });
    const { result } = renderHook(() => useMessenger(creds));
    await expect(result.current.createChat('79990000000')).rejects.toThrow(MESSENGER_TEXTS.notRegistered);
    await expect(result.current.createChat('79990000000')).rejects.toThrow(MESSENGER_TEXTS.notRegistered);
    expect(checkAccount).toHaveBeenCalledTimes(1);
  });

  it('не выдаёт ошибку checkAccount с HTTP 200 за «номер не зарегистрирован»', async () => {
    vi.mocked(checkAccount).mockResolvedValue({ status: false, reason: 'instance is starting or not authorized' });
    const { result } = renderHook(() => useMessenger(creds));
    await expect(result.current.createChat('79991234567')).rejects.toThrow(INSTANCE_STATE_TEXTS.notAuthorized);
  });

  it('помечает сообщение ошибкой по статусу failed без idMessage', async () => {
    sendMock.mockResolvedValue({ idMessage: 'srv-1' });
    const failed = deferred<Received>();
    receiveMock.mockImplementationOnce(() => failed.promise).mockImplementation(hangUntilAbort);
    const { result } = await openChat();
    await act(() => result.current.send('привет'));
    failed.resolve({
      receiptId: 1,
      body: {
        typeWebhook: 'outgoingMessageStatus',
        chatId: 'c1',
        status: 'failed',
        description: 'chatId unresolvable on this session',
      } as never,
    });
    await waitFor(() =>
      expect(result.current.activeChat?.messages[0]).toMatchObject({
        status: 'failed',
        error: MESSENGER_TEXTS.chatUnresolvable,
      }),
    );
  });

  it.each([
    [{ typeWebhook: 'stateInstanceChanged', stateInstance: 'notAuthorized' }, INSTANCE_STATE_TEXTS.notAuthorized],
    [
      { typeWebhook: 'quotaExceeded', quotaData: { description: 'Monthly quota has been exceeded' } },
      MESSENGER_TEXTS.quotaExceeded,
    ],
  ])('показывает служебное уведомление %j', async (body, text) => {
    receiveMock.mockResolvedValueOnce({ receiptId: 1, body } as never).mockImplementation(hangUntilAbort);
    const { result } = renderHook(() => useMessenger(creds));
    await waitFor(() => expect(result.current.notice).toBe(text));
  });

  it('колбэки стабильны между рендерами', async () => {
    const { result, rerender } = await openChat();
    const { send, createChat, selectChat, closeChat } = result.current;
    rerender();
    expect(result.current).toMatchObject({ send, createChat, selectChat, closeChat });
  });
});
