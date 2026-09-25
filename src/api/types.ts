import type { Chat, Message } from '../types';

export type InstanceState = 'authorized' | 'notAuthorized' | 'blocked' | 'suspended' | 'starting' | 'pendingPassword';

export interface SenderData {
  chatId: string;
  chatType?: string;
  chatName?: string;
  senderName?: string;
  senderContactName?: string;
  senderPhoneNumber?: number;
}

export interface MessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string };
}

export interface Notification {
  typeWebhook: string;
}

export interface MessageNotification extends Notification {
  typeWebhook: 'incomingMessageReceived' | 'outgoingMessageReceived';
  idMessage?: string;
  timestamp?: number;
  senderData?: SenderData;
  messageData?: MessageData;
}

export interface StatusNotification extends Notification {
  typeWebhook: 'outgoingMessageStatus';
  idMessage?: string;
  chatId?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup';
  description?: string;
  timestamp?: number;
}

export interface StateNotification extends Notification {
  typeWebhook: 'stateInstanceChanged';
  stateInstance?: string;
}

export interface QuotaNotification extends Notification {
  typeWebhook: 'quotaExceeded';
  quotaData?: { description?: string };
}

export interface ReceivedNotification {
  receiptId?: number;
  body?: Notification;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number>;
  pathSuffix?: string;
  signal?: AbortSignal;
}

export interface ParsedMessage {
  chat: Pick<Chat, 'chatId' | 'phone' | 'name'>;
  message: Message;
}

export interface InstanceSettings {
  typeInstance?: string;
  webhookUrl?: string;
  incomingWebhook?: string;
  outgoingWebhook?: string;
  outgoingMessageWebhook?: string;
  outgoingAPIMessageWebhook?: string;
}

export interface CheckAccountResponse {
  exist?: boolean;
  chatId?: string;
  status?: boolean;
  reason?: string;
  data?: { reason?: string };
}
