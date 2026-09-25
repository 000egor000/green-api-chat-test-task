import type { Page } from '@playwright/test';

import { LOGIN_TEXTS } from '../../src/constants';
import { INSTANCE } from './mockGreenApi';

export async function submitLogin(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder(LOGIN_TEXTS.idInstancePlaceholder).fill(INSTANCE.idInstance);
  await page.getByPlaceholder(LOGIN_TEXTS.apiTokenPlaceholder).fill(INSTANCE.apiTokenInstance);
  await page.getByRole('button', { name: LOGIN_TEXTS.submit }).click();
}
