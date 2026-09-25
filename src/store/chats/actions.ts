import type { ChatFields, Message, MessageStatus } from '../../types';

export type ChatsAction =
  | { type: 'upsertChat'; chat: ChatFields }
  | { type: 'addMessage'; chat: ChatFields; message: Message; markUnread: boolean }
  | { type: 'confirmMessage'; chatId: string; localId: string; id: string; status: MessageStatus }
  | { type: 'setStatus'; chatId: string; id: string; status: MessageStatus; error?: string }
  | { type: 'failLastOutgoing'; chatId: string; error?: string }
  | { type: 'markRead'; chatId: string };
