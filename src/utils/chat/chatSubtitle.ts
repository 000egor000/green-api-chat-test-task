import { CHAT_TEXTS } from '../../constants';
import type { Chat } from '../../types';
import { formatPhone } from '../formatPhone';

export function chatSubtitle(chat: Chat): string {
  return chat.phone ? formatPhone(chat.phone) : CHAT_TEXTS.idFallback(chat.chatId);
}
