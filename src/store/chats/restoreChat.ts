import type { Chat, Message } from '../../types';
import { optionalString } from './optionalString';
import { restoreMessage } from './restoreMessage';
import type { StoredChat, StoredMessage } from './storedTypes';

export function restoreChat(chat: StoredChat): Chat | null {
  if (typeof chat?.chatId !== 'string' || !chat.chatId) return null;
  const messages = Array.isArray(chat.messages) ? (chat.messages as StoredMessage[]) : [];
  return {
    chatId: chat.chatId,
    phone: optionalString(chat.phone),
    name: optionalString(chat.name),
    unread: typeof chat.unread === 'number' ? chat.unread : 0,
    messages: messages.map(restoreMessage).filter((m): m is Message => m !== null),
  };
}
