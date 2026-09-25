import type { MessageStatus } from '../../types';

const RANK: Record<MessageStatus, number> = { pending: 0, failed: 1, sent: 2, delivered: 3, read: 4 };

export function mergeStatus(current: MessageStatus | undefined, next: MessageStatus): MessageStatus {
  if (!current) return next;
  if (next === 'failed') return current === 'pending' || current === 'sent' ? 'failed' : current;
  return RANK[next] > RANK[current] ? next : current;
}
