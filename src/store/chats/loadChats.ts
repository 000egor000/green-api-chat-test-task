import type { Chat } from '../../types';
import { readJson } from '../../utils';
import { chatsStorageKey } from './chatsStorageKey';
import { restoreChat } from './restoreChat';
import type { StoredChat } from './storedTypes';

export function loadChats(idInstance: string): Chat[] {
  const stored = readJson<unknown>(chatsStorageKey(idInstance), null);
  if (!Array.isArray(stored)) return [];
  return (stored as StoredChat[]).map(restoreChat).filter((chat): chat is Chat => chat !== null);
}
