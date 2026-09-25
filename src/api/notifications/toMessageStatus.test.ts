import { describe, expect, it } from 'vitest';

import type { StatusNotification } from '../types';
import { toMessageStatus } from './toMessageStatus';

const status = (value?: StatusNotification['status']) =>
  toMessageStatus({ typeWebhook: 'outgoingMessageStatus', status: value });

describe('toMessageStatus', () => {
  it.each(['sent', 'delivered', 'read', 'failed'] as const)('передаёт %s как есть', (value) => {
    expect(status(value)).toBe(value);
  });

  it.each(['noAccount', 'notInGroup'] as const)('считает %s ошибкой отправки', (value) => {
    expect(status(value)).toBe('failed');
  });

  it('возвращает null без статуса', () => {
    expect(status()).toBeNull();
  });
});
