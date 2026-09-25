import { expect, type Page } from '@playwright/test';

import { SIDEBAR_TEXTS } from '../../src/constants';
import { submitLogin } from './submitLogin';

export async function login(page: Page) {
  await submitLogin(page);
  await expect(page.getByText(SIDEBAR_TEXTS.title)).toBeVisible();
}
