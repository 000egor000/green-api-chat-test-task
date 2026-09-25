import { describe, expect, it } from 'vitest';

import { MESSENGER_TEXTS } from '../../constants';
import { describeDeliveryError } from './describeDeliveryError';

const status = (patch: object) => describeDeliveryError({ typeWebhook: 'outgoingMessageStatus', ...patch });

describe('describeDeliveryError', () => {
  it('объясняет noAccount', () => {
    expect(status({ status: 'noAccount' })).toBe(MESSENGER_TEXTS.noAccount);
  });

  it('переводит «chatId unresolvable on this session»', () => {
    expect(status({ status: 'failed', description: 'chatId unresolvable on this session' })).toBe(
      MESSENGER_TEXTS.chatUnresolvable,
    );
  });

  it('показывает прочие описания как есть', () => {
    expect(status({ status: 'failed', description: 'media caption too long' })).toBe('media caption too long');
  });

  it('без описания возвращает undefined', () => {
    expect(status({ status: 'failed' })).toBeUndefined();
  });
});
