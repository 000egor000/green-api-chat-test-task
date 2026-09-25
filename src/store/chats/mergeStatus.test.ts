import { describe, expect, it } from 'vitest';

import type { MessageStatus } from '../../types';
import { mergeStatus } from './mergeStatus';

describe('mergeStatus', () => {
  it.each<[MessageStatus | undefined, MessageStatus, MessageStatus]>([
    [undefined, 'sent', 'sent'],
    ['pending', 'sent', 'sent'],
    ['sent', 'read', 'read'],
    ['read', 'sent', 'read'],
    ['read', 'delivered', 'read'],
    ['pending', 'failed', 'failed'],
    ['sent', 'failed', 'failed'],
    ['delivered', 'failed', 'delivered'],
    ['failed', 'sent', 'sent'],
  ])('%s + %s → %s', (current, next, expected) => {
    expect(mergeStatus(current, next)).toBe(expected);
  });
});
