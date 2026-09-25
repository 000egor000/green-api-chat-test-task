import { expect, test } from '@playwright/test';

import { INSTANCE_STATE_TEXTS, SIDEBAR_TEXTS } from '../src/constants';
import { login } from './support/login';
import { INSTANCE, mockGreenApi } from './support/mockGreenApi';
import { submitLogin } from './support/submitLogin';

test('успешный вход открывает список чатов', async ({ page }) => {
  await mockGreenApi(page);
  await login(page);
  await expect(page.getByText(SIDEBAR_TEXTS.instance(INSTANCE.idInstance))).toBeVisible();
  await expect(page.getByText(SIDEBAR_TEXTS.empty)).toBeVisible();
});

test('неавторизованный инстанс показывает понятную ошибку', async ({ page }) => {
  await mockGreenApi(page, { state: 'notAuthorized' });
  await submitLogin(page);
  await expect(page.getByText(INSTANCE_STATE_TEXTS.notAuthorized)).toBeVisible();
});
