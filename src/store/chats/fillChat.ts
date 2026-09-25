import type { Chat, ChatFields } from '../../types';

export function fillChat(chat: Chat, { phone, name }: ChatFields): Chat {
  const nextPhone = chat.phone ?? phone;
  const nextName = chat.name ?? name;
  return nextPhone === chat.phone && nextName === chat.name ? chat : { ...chat, phone: nextPhone, name: nextName };
}
