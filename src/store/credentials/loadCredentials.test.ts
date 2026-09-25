import { beforeEach, describe, expect, it } from 'vitest';

import { clearCredentials } from './clearCredentials';
import { credentialsStorageKey } from './credentialsStorageKey';
import { loadCredentials } from './loadCredentials';
import { saveCredentials } from './saveCredentials';

const creds = { idInstance: '4100000001', apiTokenInstance: 'token', apiUrl: 'https://4100.api.green-api.com' };

describe('loadCredentials', () => {
  beforeEach(() => localStorage.clear());

  it('сохраняет и читает учётные данные', () => {
    saveCredentials(creds);
    expect(loadCredentials()).toEqual(creds);
  });

  it('удаляет учётные данные', () => {
    saveCredentials(creds);
    clearCredentials();
    expect(loadCredentials()).toBeNull();
  });

  it.each([
    ['повреждённый JSON', '{"idInstance":1'],
    ['не хватает токена', JSON.stringify({ idInstance: '1', apiUrl: 'u' })],
    ['null', 'null'],
  ])('возвращает null: %s', (_, raw) => {
    localStorage.setItem(credentialsStorageKey(), raw);
    expect(loadCredentials()).toBeNull();
  });

  it('не тащит лишние поля из хранилища', () => {
    localStorage.setItem(credentialsStorageKey(), JSON.stringify({ ...creds, extra: 1 }));
    expect(loadCredentials()).toEqual(creds);
  });
});
