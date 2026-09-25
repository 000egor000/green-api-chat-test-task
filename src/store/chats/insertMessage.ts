import type { Message } from '../../types';

export function insertMessage(messages: Message[], message: Message): Message[] {
  let index = messages.length;
  while (index > 0 && (messages[index - 1]?.timestamp ?? 0) > message.timestamp) index -= 1;
  return [...messages.slice(0, index), message, ...messages.slice(index)];
}
