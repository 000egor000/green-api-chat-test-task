export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageDirection = 'in' | 'out';

export interface Message {
  id: string;
  key: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status?: MessageStatus;
  error?: string;
}

export interface Chat {
  chatId: string;
  phone?: string;
  name?: string;
  messages: Message[];
  unread: number;
}

export type ChatFields = Pick<Chat, 'chatId'> & Partial<Pick<Chat, 'phone' | 'name'>>;

export type ConnectionState = 'online' | 'offline' | 'unauthorized' | 'webhookSet';

export interface MessageListItem {
  message: Message;
  separator: string | null;
}
