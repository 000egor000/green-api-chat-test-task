import type { Chat } from '../../types';
import { replaceAt } from '../../utils';
import type { ChatsAction } from './actions';
import { createChat } from './createChat';
import { fillChat } from './fillChat';
import { findLastPendingOutgoing } from './findLastPendingOutgoing';
import { insertMessage } from './insertMessage';
import { mergeStatus } from './mergeStatus';
import { resolveChatIndex } from './resolveChatIndex';
import { updateMessageStatus } from './updateMessageStatus';

export function chatsReducer(chats: Chat[], action: ChatsAction): Chat[] {
  switch (action.type) {
    case 'upsertChat': {
      const index = chats.findIndex((chat) => chat.chatId === action.chat.chatId);
      const existing = chats[index];
      if (!existing) return [createChat(action.chat), ...chats];
      const filled = fillChat(existing, action.chat);
      return filled === existing ? chats : replaceAt(chats, index, filled);
    }
    case 'addMessage': {
      const { chat: fields, message, markUnread } = action;
      const index = chats.findIndex((chat) => chat.chatId === fields.chatId);
      const existing = chats[index];
      if (existing?.messages.some((m) => m.id === message.id)) return chats;
      const base = existing ? fillChat(existing, fields) : createChat(fields);
      const updated: Chat = {
        ...base,
        messages: insertMessage(base.messages, message),
        unread: markUnread ? base.unread + 1 : base.unread,
      };
      return [updated, ...chats.filter((chat) => chat !== existing)];
    }
    case 'confirmMessage': {
      const { chatId, localId, id, status } = action;
      const index = chats.findIndex((chat) => chat.chatId === chatId);
      const chat = chats[index];
      const local = chat?.messages.findIndex((m) => m.id === localId) ?? -1;
      const message = chat?.messages[local];
      if (!chat || !message) return chats;
      const duplicate = id !== localId && chat.messages.some((m) => m.id === id);
      const messages = duplicate
        ? chat.messages.filter((m) => m !== message)
        : replaceAt(chat.messages, local, { ...message, id, status: mergeStatus(message.status, status) });
      return replaceAt(chats, index, { ...chat, messages });
    }
    case 'setStatus': {
      const index = resolveChatIndex(chats, action.chatId);
      const position = chats[index]?.messages.findIndex((m) => m.id === action.id) ?? -1;
      return updateMessageStatus(chats, index, position, action.status, action.error);
    }
    case 'failLastOutgoing': {
      const index = resolveChatIndex(chats, action.chatId);
      const position = findLastPendingOutgoing(chats[index]?.messages ?? []);
      return updateMessageStatus(chats, index, position, 'failed', action.error);
    }
    case 'markRead': {
      const index = chats.findIndex((chat) => chat.chatId === action.chatId);
      const chat = chats[index];
      return chat?.unread ? replaceAt(chats, index, { ...chat, unread: 0 }) : chats;
    }
  }
}
