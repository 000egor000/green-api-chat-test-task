import type { Page } from '@playwright/test';

import { SIDEBAR_TEXTS } from '../../src/constants';

export async function openChat(page: Page, phone: string) {
  await page.getByPlaceholder(SIDEBAR_TEXTS.phonePlaceholder).fill(phone);
  await page.getByRole('button', { name: SIDEBAR_TEXTS.createChat }).click();
}
