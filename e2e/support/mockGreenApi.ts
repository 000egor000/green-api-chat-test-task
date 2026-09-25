import type { Page, Route } from '@playwright/test';

export const INSTANCE = { idInstance: '4100123456', apiTokenInstance: 'test-token' };

const API_HOST = 'https://4100.api.green-api.com';

interface MockOptions {
  state?: string;
  accounts?: Record<string, string>;
  failSend?: boolean;
}

export interface GreenApiMock {
  calls: { method: string; body: unknown }[];
  push: (body: Record<string, unknown>) => void;
  lastSentId: () => string | undefined;
}

export async function mockGreenApi(page: Page, options: MockOptions = {}): Promise<GreenApiMock> {
  const queue: { receiptId: number; body: Record<string, unknown> }[] = [];
  const calls: GreenApiMock['calls'] = [];
  const sentIds: string[] = [];
  let receipt = 1;

  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: body === null ? '' : JSON.stringify(body),
    });

  await page.route(`${API_HOST}/**`, async (route) => {
    const request = route.request();
    const method = new URL(request.url()).pathname.split('/')[2] ?? '';
    const body = request.postDataJSON() as Record<string, unknown> | null;
    calls.push({ method, body });

    switch (method) {
      case 'getStateInstance':
        return json(route, { stateInstance: options.state ?? 'authorized' });
      case 'getSettings':
        return json(route, {
          typeInstance: 'telegram',
          webhookUrl: '',
          incomingWebhook: 'yes',
          outgoingWebhook: 'yes',
        });
      case 'checkAccount': {
        const chatId = options.accounts?.[String(body?.phoneNumber)];
        return json(route, { exist: Boolean(chatId), chatId: chatId ?? '' });
      }
      case 'sendMessage': {
        if (options.failSend) return json(route, null, 500);
        const idMessage = `srv-${sentIds.length + 1}`;
        sentIds.push(idMessage);
        return json(route, { idMessage });
      }
      case 'receiveNotification': {
        for (let i = 0; i < 10 && !queue.length; i++) await new Promise((r) => setTimeout(r, 100));
        return json(route, queue.shift() ?? null);
      }
      case 'deleteNotification':
        return json(route, { result: true });
      default:
        return json(route, null, 404);
    }
  });

  return {
    calls,
    push: (body) => queue.push({ receiptId: receipt++, body }),
    lastSentId: () => sentIds.at(-1),
  };
}
