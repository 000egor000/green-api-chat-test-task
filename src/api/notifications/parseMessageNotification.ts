import { nowUnix } from '../../utils';
import type { MessageNotification, ParsedMessage } from '../types';

const PRIVATE_CHAT = 'user';

export function parseMessageNotification(n: MessageNotification): ParsedMessage | null {
  const text = n.messageData?.textMessageData?.textMessage ?? n.messageData?.extendedTextMessageData?.text;
  const chatId = n.senderData?.chatId;
  if (typeof text !== 'string' || typeof n.idMessage !== 'string' || typeof chatId !== 'string' || !chatId) {
    return null;
  }

  const incoming = n.typeWebhook === 'incomingMessageReceived';
  const { chatType, chatName, senderName, senderContactName, senderPhoneNumber } = n.senderData ?? {};
  const isPrivate = (chatType ?? PRIVATE_CHAT) === PRIVATE_CHAT && !chatId.startsWith('-');
  const senderTitle = incoming && isPrivate ? senderContactName || senderName : undefined;
  return {
    chat: {
      chatId,
      phone: incoming && isPrivate && senderPhoneNumber ? String(senderPhoneNumber) : undefined,
      name: senderTitle || chatName || undefined,
    },
    message: {
      id: n.idMessage,
      key: n.idMessage,
      text,
      direction: incoming ? 'in' : 'out',
      timestamp: typeof n.timestamp === 'number' ? n.timestamp : nowUnix(),
      status: incoming ? undefined : 'sent',
    },
  };
}
