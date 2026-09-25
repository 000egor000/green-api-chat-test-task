import type { Chat } from '../../types';
import { writeJson } from '../../utils';
import { chatsStorageKey } from './chatsStorageKey';

const MAX_STORED_MESSAGES = 500;

export function saveChats(idInstance: string, chats: Chat[]): void {
  writeJson(
    chatsStorageKey(idInstance),
    chats.map((chat) => ({ ...chat, messages: chat.messages.slice(-MAX_STORED_MESSAGES) })),
  );
}
