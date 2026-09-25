import { beforeEach, describe, expect, it, vi } from 'vitest';

import { API_ERROR_TEXTS, INSTANCE_STATE_TEXTS, LOGIN_TEXTS } from '../constants';
import { getSettings } from './methods/getSettings';
import { getStateInstance } from './methods/getStateInstance';
import { verifyInstance } from './verifyInstance';

vi.mock('./methods/getStateInstance', () => ({ getStateInstance: vi.fn() }));
vi.mock('./methods/getSettings', () => ({ getSettings: vi.fn() }));

const creds = { idInstance: '4100000000', apiTokenInstance: 't', apiUrl: 'https://4100.api.green-api.com' };
const ready = { typeInstance: 'telegram', webhookUrl: '', incomingWebhook: 'yes' };

describe('verifyInstance', () => {
  beforeEach(() => {
    vi.mocked(getStateInstance).mockResolvedValue({ stateInstance: 'authorized' });
    vi.mocked(getSettings).mockResolvedValue(ready);
  });

  it('пропускает авторизованный и правильно настроенный инстанс', async () => {
    await expect(verifyInstance(creds)).resolves.toBeUndefined();
  });

  it.each([
    [
      'не авторизован',
      () => vi.mocked(getStateInstance).mockResolvedValue({ stateInstance: 'notAuthorized' }),
      INSTANCE_STATE_TEXTS.notAuthorized,
    ],
    ['пустой ответ', () => vi.mocked(getStateInstance).mockResolvedValue(null), API_ERROR_TEXTS.emptyResponse],
    [
      'задан webhookUrl',
      () => vi.mocked(getSettings).mockResolvedValue({ ...ready, webhookUrl: 'https://x' }),
      API_ERROR_TEXTS.webhookSet,
    ],
    [
      'выключены входящие',
      () => vi.mocked(getSettings).mockResolvedValue({ ...ready, incomingWebhook: 'no' }),
      LOGIN_TEXTS.incomingDisabled,
    ],
    [
      'инстанс WhatsApp',
      () => vi.mocked(getSettings).mockResolvedValue({ ...ready, typeInstance: 'whatsapp' }),
      LOGIN_TEXTS.wrongInstanceType('whatsapp'),
    ],
  ])('отклоняет: %s', async (_, arrange, text) => {
    arrange();
    await expect(verifyInstance(creds)).rejects.toThrow(text);
  });
});
