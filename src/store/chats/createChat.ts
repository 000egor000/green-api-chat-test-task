import type { Chat, ChatFields } from '../../types';

export function createChat({ chatId, phone, name }: ChatFields): Chat {
  return { chatId, phone, name, messages: [], unread: 0 };
}
