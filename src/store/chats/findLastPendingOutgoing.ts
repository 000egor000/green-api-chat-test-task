import type { Message } from '../../types';

export function findLastPendingOutgoing(messages: Message[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.direction === 'out' && (message.status === 'pending' || message.status === 'sent')) return index;
  }
  return -1;
}
