import { useCallback, useRef, useState } from 'react';

import {
  checkAccount,
  describeCheckAccountFailure,
  describeDeliveryError,
  describeInstanceState,
  isMessageNotification,
  isQuotaNotification,
  isStateNotification,
  isStatusNotification,
  parseMessageNotification,
  sendMessage,
  toMessageStatus,
  type Notification,
} from '../api';
import { API_ERROR_TEXTS, MESSENGER_TEXTS } from '../constants';
import type { Credentials, MessageStatus } from '../types';
import { BoundedMap, createLocalId, messageRef, nowUnix, UserError, userMessage } from '../utils';
import { useChats } from './useChats';
import { useLatest } from './useLatest';
import { useNotifications } from './useNotifications';

const STATUS_BUFFER_SIZE = 200;

export function useMessenger(creds: Credentials) {
  const [chats, dispatch] = useChats(creds.idInstance);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null;
  const latestChats = useLatest(chats);
  const latestActiveId = useLatest(activeChatId);
  const earlyStatuses = useRef(new BoundedMap<string, MessageStatus>(STATUS_BUFFER_SIZE));
  const unregisteredPhones = useRef(new Set<string>());

  const handleNotification = useCallback(
    (body: Notification) => {
      if (isStatusNotification(body)) {
        const status = toMessageStatus(body);
        const { chatId, idMessage } = body;
        if (!status || !chatId) return;
        const error = describeDeliveryError(body);
        if (idMessage) {
          earlyStatuses.current.set(messageRef(chatId, idMessage), status);
          dispatch({ type: 'setStatus', chatId, id: idMessage, status, error });
        } else if (status === 'failed') {
          dispatch({ type: 'failLastOutgoing', chatId, error });
        }
        return;
      }
      if (isStateNotification(body)) {
        const state = body.stateInstance;
        if (!state) return;
        setNotice(state === 'authorized' ? null : describeInstanceState(state));
        return;
      }
      if (isQuotaNotification(body)) {
        setNotice(MESSENGER_TEXTS.quotaExceeded);
        return;
      }
      const parsed = isMessageNotification(body) ? parseMessageNotification(body) : null;
      if (!parsed) return;
      const { chat, message } = parsed;
      dispatch({
        type: 'addMessage',
        chat,
        message,
        markUnread: message.direction === 'in' && chat.chatId !== latestActiveId.current,
      });
    },
    [dispatch, latestActiveId],
  );

  const connection = useNotifications(creds, handleNotification);

  const selectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      dispatch({ type: 'markRead', chatId });
    },
    [dispatch],
  );

  const closeChat = useCallback(() => setActiveChatId(null), []);

  const createChat = useCallback(
    async (phone: string) => {
      const existing = latestChats.current.find((chat) => chat.phone === phone);
      if (existing) {
        selectChat(existing.chatId);
        return;
      }
      if (unregisteredPhones.current.has(phone)) throw new UserError(MESSENGER_TEXTS.notRegistered);
      const account = await checkAccount(creds, phone);
      const failure = describeCheckAccountFailure(account);
      if (failure) throw new UserError(failure);
      if (!account?.exist || !account.chatId) {
        unregisteredPhones.current.add(phone);
        throw new UserError(MESSENGER_TEXTS.notRegistered);
      }
      dispatch({ type: 'upsertChat', chat: { chatId: account.chatId, phone } });
      selectChat(account.chatId);
    },
    [creds, dispatch, latestChats, selectChat],
  );

  const send = useCallback(
    async (text: string) => {
      const chatId = latestActiveId.current;
      if (!chatId) return;
      const localId = createLocalId();
      dispatch({
        type: 'addMessage',
        chat: { chatId },
        markUnread: false,
        message: { id: localId, key: localId, text, direction: 'out', timestamp: nowUnix(), status: 'pending' },
      });
      try {
        const sent = await sendMessage(creds, chatId, text);
        const id = sent?.idMessage ?? localId;
        const status = earlyStatuses.current.take(messageRef(chatId, id)) ?? 'sent';
        dispatch({ type: 'confirmMessage', chatId, localId, id, status });
      } catch (error) {
        const reason = userMessage(error, API_ERROR_TEXTS.sendFailed);
        dispatch({ type: 'setStatus', chatId, id: localId, status: 'failed', error: reason });
      }
    },
    [creds, dispatch, latestActiveId],
  );

  return { chats, activeChat, connection, notice, selectChat, closeChat, createChat, send };
}
