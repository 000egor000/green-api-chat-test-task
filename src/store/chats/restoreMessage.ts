import type { Message } from '../../types';
import { isMessageStatus } from './isMessageStatus';
import type { StoredMessage } from './storedTypes';

export function restoreMessage(m: StoredMessage): Message | null {
  if (typeof m?.id !== 'string' || typeof m.text !== 'string' || typeof m.timestamp !== 'number') return null;
  if (m.direction !== 'in' && m.direction !== 'out') return null;
  const status = isMessageStatus(m.status) ? m.status : undefined;
  return {
    id: m.id,
    key: typeof m.key === 'string' ? m.key : m.id,
    text: m.text,
    direction: m.direction,
    timestamp: m.timestamp,
    status: status === 'pending' ? 'failed' : status,
    error: typeof m.error === 'string' ? m.error : undefined,
  };
}
