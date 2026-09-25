import { describe, expect, it } from 'vitest';

import { API_ERROR_TEXTS } from '../constants';
import { describeStatus } from './describeStatus';

describe('describeStatus', () => {
  it.each([
    ['Message cannot be received because custom webhook url is set. Go to cabinet…', API_ERROR_TEXTS.webhookSet],
    ['instance in starting process try later', API_ERROR_TEXTS.instanceStarting],
    ['Instance account is expired', API_ERROR_TEXTS.instanceExpired],
    ['Instance is deleted', API_ERROR_TEXTS.instanceDeleted],
  ])('различает ошибку 400 по тексту из тела: %s', (reason, text) => {
    expect(describeStatus(400, reason)).toBe(text);
  });

  it.each([
    [400, API_ERROR_TEXTS.badRequest],
    [403, API_ERROR_TEXTS.unauthorized],
    [466, API_ERROR_TEXTS.quotaExceeded],
    [469, API_ERROR_TEXTS.messengerRateLimit],
    [502, API_ERROR_TEXTS.serverUnavailable],
    [418, API_ERROR_TEXTS.unknown(418)],
  ])('статус %i без известного текста', (status, text) => {
    expect(describeStatus(status, 'something else')).toBe(text);
  });
});
