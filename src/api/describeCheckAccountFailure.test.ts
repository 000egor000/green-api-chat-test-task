import { describe, expect, it } from 'vitest';

import { INSTANCE_STATE_TEXTS, MESSENGER_TEXTS } from '../constants';
import { describeCheckAccountFailure } from './describeCheckAccountFailure';

describe('describeCheckAccountFailure', () => {
  it('не считает ошибкой обычный ответ', () => {
    expect(describeCheckAccountFailure({ exist: false, chatId: '' })).toBeNull();
    expect(describeCheckAccountFailure(null)).toBeNull();
  });

  it.each([
    [{ status: false, reason: 'instance is starting or not authorized' }, INSTANCE_STATE_TEXTS.notAuthorized],
    [{ status: false, data: { reason: 'rate_limit_exceeded' } }, MESSENGER_TEXTS.checkRateLimited],
    [{ status: false, reason: "request should contain 'phoneNumber' or 'username'" }, MESSENGER_TEXTS.checkFailed],
  ])('ответ HTTP 200 с ошибкой %j', (response, text) => {
    expect(describeCheckAccountFailure(response)).toBe(text);
  });
});
