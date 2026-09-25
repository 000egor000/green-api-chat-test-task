import type { Chat, MessageStatus } from '../../types';
import { replaceAt } from '../../utils';
import { mergeStatus } from './mergeStatus';

export function updateMessageStatus(
  chats: Chat[],
  chatIndex: number,
  messageIndex: number,
  status: MessageStatus,
  error: string | undefined,
): Chat[] {
  const chat = chats[chatIndex];
  const message = chat?.messages[messageIndex];
  if (!chat || !message) return chats;
  const merged = mergeStatus(message.status, status);
  const nextError = merged === 'failed' ? (error ?? message.error) : message.error;
  if (merged === message.status && nextError === message.error) return chats;
  const messages = replaceAt(chat.messages, messageIndex, { ...message, status: merged, error: nextError });
  return replaceAt(chats, chatIndex, { ...chat, messages });
}
