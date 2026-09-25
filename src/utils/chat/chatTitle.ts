import type { Chat } from '../../types';
import { chatSubtitle } from './chatSubtitle';

export function chatTitle(chat: Chat): string {
  return chat.name ?? chatSubtitle(chat);
}
