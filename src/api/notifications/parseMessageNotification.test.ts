import { describe, expect, it } from 'vitest';

import type { MessageNotification } from '../types';
import { parseMessageNotification } from './parseMessageNotification';

const incoming: MessageNotification = {
  typeWebhook: 'incomingMessageReceived',
  idMessage: 'm1',
  timestamp: 1_700_000_000,
  senderData: {
    chatId: '10000000',
    chatName: 'Чат',
    senderName: 'Имя',
    senderContactName: 'Контакт',
    senderPhoneNumber: 79991234567,
  },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'привет' } },
};

describe('parseMessageNotification', () => {
  it('разбирает входящее текстовое сообщение', () => {
    expect(parseMessageNotification(incoming)).toEqual({
      chat: { chatId: '10000000', phone: '79991234567', name: 'Контакт' },
      message: { id: 'm1', key: 'm1', text: 'привет', direction: 'in', timestamp: 1_700_000_000, status: undefined },
    });
  });

  it('берёт имя отправителя, если нет имени в контактах', () => {
    const parsed = parseMessageNotification({ ...incoming, senderData: { chatId: '1', senderName: 'Имя' } });
    expect(parsed?.chat.name).toBe('Имя');
  });

  it('разбирает исходящее с телефона: без телефона и имени отправителя', () => {
    const parsed = parseMessageNotification({ ...incoming, typeWebhook: 'outgoingMessageReceived' });
    expect(parsed?.chat).toEqual({ chatId: '10000000', phone: undefined, name: 'Чат' });
    expect(parsed?.message).toMatchObject({ direction: 'out', status: 'sent' });
  });

  it('для группы берёт название чата, а не автора, и не ставит телефон', () => {
    const parsed = parseMessageNotification({
      ...incoming,
      senderData: {
        chatId: '-10000000000000',
        chatType: 'group',
        chatName: 'Тридесятое царство',
        senderName: 'Василиса',
        senderPhoneNumber: 0,
      },
    });
    expect(parsed?.chat).toEqual({ chatId: '-10000000000000', phone: undefined, name: 'Тридесятое царство' });
  });

  it('поддерживает extendedTextMessage', () => {
    const parsed = parseMessageNotification({
      ...incoming,
      messageData: { typeMessage: 'extendedTextMessage', extendedTextMessageData: { text: 'ссылка' } },
    });
    expect(parsed?.message.text).toBe('ссылка');
  });

  it.each<[string, Partial<MessageNotification>]>([
    ['нетекстовое сообщение', { messageData: { typeMessage: 'imageMessage' } }],
    ['нет messageData', { messageData: undefined }],
    ['нет senderData', { senderData: undefined }],
    ['нет idMessage', { idMessage: undefined }],
  ])('возвращает null: %s', (_, patch) => {
    expect(parseMessageNotification({ ...incoming, ...patch })).toBeNull();
  });

  it('подставляет текущее время, если нет timestamp', () => {
    const parsed = parseMessageNotification({ ...incoming, timestamp: undefined });
    expect(parsed?.message.timestamp).toBeGreaterThan(1_700_000_000);
  });
});
