import { expect, test } from '@playwright/test';

import {
  API_ERROR_TEXTS,
  CHAT_VIEW_TEXTS,
  COMPOSER_TEXTS,
  MESSAGE_STATUS_TEXTS,
  MESSENGER_TEXTS,
} from '../src/constants';
import { incomingMessage } from './support/incomingMessage';
import { login } from './support/login';
import { mockGreenApi } from './support/mockGreenApi';
import { openChat } from './support/openChat';

const PHONE = '79991234567';
const CHAT_ID = '10000000';

test('отправка сообщения и получение ответа', async ({ page }) => {
  const api = await mockGreenApi(page, { accounts: { [PHONE]: CHAT_ID } });
  await login(page);
  await openChat(page, PHONE);

  await expect(page.getByText(CHAT_VIEW_TEXTS.emptyTitle)).toBeVisible();
  await page.getByPlaceholder(COMPOSER_TEXTS.placeholder).fill('Привет!');
  await page.keyboard.press('Enter');

  await expect(page.locator('main').getByText('Привет!')).toBeVisible();
  await expect
    .poll(() => api.calls.find((c) => c.method === 'sendMessage')?.body)
    .toEqual({
      chatId: CHAT_ID,
      message: 'Привет!',
    });
  await expect(page.getByPlaceholder(COMPOSER_TEXTS.placeholder)).toHaveValue('');

  api.push({ typeWebhook: 'outgoingMessageStatus', chatId: CHAT_ID, idMessage: api.lastSentId(), status: 'read' });
  api.push(incomingMessage(CHAT_ID, 'И тебе привет'));

  await expect(page.locator('main').getByText('И тебе привет')).toBeVisible();
  await expect(page.locator('main').getByText('Василиса Премудрая')).toBeVisible();
});

test('номер без Telegram показывает ошибку', async ({ page }) => {
  await mockGreenApi(page);
  await login(page);
  await openChat(page, '79990000000');
  await expect(page.getByText(MESSENGER_TEXTS.notRegistered)).toBeVisible();
});

test('ошибка отправки помечает сообщение', async ({ page }) => {
  await mockGreenApi(page, { accounts: { [PHONE]: CHAT_ID }, failSend: true });
  await login(page);
  await openChat(page, PHONE);
  await page.getByPlaceholder(COMPOSER_TEXTS.placeholder).fill('не уйдёт');
  await page.keyboard.press('Enter');
  await expect(page.getByTitle(API_ERROR_TEXTS.serverUnavailable)).toContainText(MESSAGE_STATUS_TEXTS.failedMark);
});

test('входящее от нового контакта создаёт чат со счётчиком непрочитанных', async ({ page }) => {
  const api = await mockGreenApi(page, { accounts: { [PHONE]: CHAT_ID } });
  await login(page);
  await openChat(page, PHONE);

  api.push(incomingMessage('20000000', 'Кто это?', 'Новый Контакт'));
  const item = page.getByRole('button', { name: /Новый Контакт/ });
  await expect(item).toContainText('Кто это?');
  await expect(item).toContainText('1');

  await item.click();
  await expect(page.locator('main').getByText('Кто это?')).toBeVisible();
  await expect(page.getByRole('button', { name: /Новый Контакт/ })).not.toContainText(/Кто это\?1$/);
});

test('история сохраняется после перезагрузки', async ({ page }) => {
  await mockGreenApi(page, { accounts: { [PHONE]: CHAT_ID } });
  await login(page);
  await openChat(page, PHONE);
  await page.getByPlaceholder(COMPOSER_TEXTS.placeholder).fill('сохрани меня');
  await page.keyboard.press('Enter');
  await expect(page.locator('main').getByText('сохрани меня')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: /\+7 999 123-45-67/ })).toContainText('сохрани меня');
});

test('статус сообщения не сбивает прокрутку, когда читаешь историю', async ({ page }) => {
  const api = await mockGreenApi(page, { accounts: { [PHONE]: CHAT_ID } });
  await login(page);
  await openChat(page, PHONE);
  const input = page.getByPlaceholder(COMPOSER_TEXTS.placeholder);
  for (let i = 1; i <= 25; i++) {
    await input.fill(`сообщение ${i}`);
    await input.press('Enter');
  }
  await expect(page.locator('main').getByText('сообщение 25')).toBeVisible();

  const list = page.locator('main section > div').first();
  expect(await list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await list.evaluate((element) => element.scrollTo({ top: 0 }));
  api.push({ typeWebhook: 'outgoingMessageStatus', chatId: CHAT_ID, idMessage: api.lastSentId(), status: 'read' });
  await page.waitForTimeout(1500);
  expect(await list.evaluate((element) => element.scrollTop)).toBe(0);
});
