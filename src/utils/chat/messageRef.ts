export function messageRef(chatId: string, idMessage: string): string {
  return `${chatId}:${idMessage}`;
}
