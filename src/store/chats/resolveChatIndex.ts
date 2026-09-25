import type { Chat } from '../../types';

const PHONE_CHAT_ID = /^(\d+)@c\.us$/;

export function resolveChatIndex(chats: Chat[], chatId: string): number {
  const exact = chats.findIndex((chat) => chat.chatId === chatId);
  if (exact !== -1) return exact;
  const phone = chatId.match(PHONE_CHAT_ID)?.[1];
  return phone ? chats.findIndex((chat) => chat.phone === phone) : -1;
}
