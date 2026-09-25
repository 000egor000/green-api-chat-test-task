import type { MessageStatus } from '../../types';

const STATUSES: readonly unknown[] = ['pending', 'sent', 'delivered', 'read', 'failed'] satisfies MessageStatus[];

export function isMessageStatus(value: unknown): value is MessageStatus {
  return STATUSES.includes(value);
}
