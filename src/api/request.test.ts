import { beforeEach, describe, expect, it, vi } from 'vitest';

import { API_ERROR_TEXTS } from '../constants';
import { GreenApiError } from './GreenApiError';
import { request } from './request';

const creds = { idInstance: '4100000001', apiTokenInstance: 'token', apiUrl: 'https://4100.api.green-api.com/' };
const fetchMock = vi.fn<typeof fetch>();

const respond = (status: number, body = '') => fetchMock.mockResolvedValueOnce(new Response(body || null, { status }));

describe('request', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('собирает URL из apiUrl, idInstance, метода и токена', async () => {
    respond(200, '{}');
    await request(creds, 'getStateInstance');
    expect(String(fetchMock.mock.lastCall?.[0])).toBe(
      'https://4100.api.green-api.com/waInstance4100000001/getStateInstance/token',
    );
  });

  it('добавляет query и суффикс пути', async () => {
    respond(200, '{}');
    await request(creds, 'deleteNotification', { method: 'DELETE', pathSuffix: '42', query: { a: 1 } });
    const [url, init] = fetchMock.mock.lastCall ?? [];
    expect(String(url)).toBe('https://4100.api.green-api.com/waInstance4100000001/deleteNotification/token/42?a=1');
    expect(init?.method).toBe('DELETE');
  });

  it('отправляет JSON-тело с заголовком', async () => {
    respond(200, '{"idMessage":"1"}');
    await expect(request(creds, 'sendMessage', { method: 'POST', body: { chatId: '1' } })).resolves.toEqual({
      idMessage: '1',
    });
    const init = fetchMock.mock.lastCall?.[1];
    expect(init?.body).toBe('{"chatId":"1"}');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('возвращает null на пустой ответ', async () => {
    respond(200);
    await expect(request(creds, 'receiveNotification')).resolves.toBeNull();
  });

  it.each([
    [401, API_ERROR_TEXTS.unauthorized],
    [404, API_ERROR_TEXTS.notFound],
    [429, API_ERROR_TEXTS.tooManyRequests],
    [466, API_ERROR_TEXTS.quotaExceeded],
    [502, API_ERROR_TEXTS.serverUnavailable],
    [418, API_ERROR_TEXTS.unknown(418)],
  ])('бросает GreenApiError на статус %i', async (status, text) => {
    respond(status);
    const error = await request(creds, 'x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GreenApiError);
    expect(error).toMatchObject({ message: text, status });
  });

  it('сообщает о некорректном apiUrl, а не о TypeError', async () => {
    await expect(request({ ...creds, apiUrl: 'abc' }, 'x')).rejects.toThrow(API_ERROR_TEXTS.invalidApiUrl);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('сообщает о некорректном ответе, а не о SyntaxError', async () => {
    respond(200, '<html>');
    await expect(request(creds, 'x')).rejects.toThrow(API_ERROR_TEXTS.invalidResponse);
  });

  it('читает причину ошибки из тела ответа', async () => {
    respond(400, JSON.stringify({ message: 'Message cannot be received because custom webhook url is set' }));
    const error = await request(creds, 'receiveNotification').catch((e: unknown) => e);
    expect(error).toMatchObject({ message: API_ERROR_TEXTS.webhookSet, isWebhookSet: true });
  });

  it('превращает сетевую ошибку в GreenApiError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(request(creds, 'x')).rejects.toThrow(API_ERROR_TEXTS.network);
  });

  it('пробрасывает отмену запроса как есть', async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValueOnce(abortError);
    await expect(request(creds, 'x', { signal: controller.signal })).rejects.toBe(abortError);
  });
});
