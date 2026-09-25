import { describe, expect, it } from 'vitest';

import type { Chat, Message } from '../../types';
import { chatsReducer } from './chatsReducer';

const message = (id: string, overrides: Partial<Message> = {}): Message => ({
  id,
  key: id,
  text: `text ${id}`,
  direction: 'in',
  timestamp: 1_700_000_000,
  ...overrides,
});

const chat = (chatId: string, overrides: Partial<Chat> = {}): Chat => ({
  chatId,
  messages: [],
  unread: 0,
  ...overrides,
});

describe('chatsReducer', () => {
  describe('upsertChat', () => {
    it('добавляет новый чат в начало списка', () => {
      const state = chatsReducer([chat('1')], { type: 'upsertChat', chat: { chatId: '2', phone: '79990000000' } });
      expect(state.map((c) => c.chatId)).toEqual(['2', '1']);
      expect(state[0]).toEqual({ chatId: '2', phone: '79990000000', name: undefined, messages: [], unread: 0 });
    });

    it('не перезаписывает известные имя и телефон', () => {
      const state = chatsReducer([chat('1', { name: 'Старое', phone: '7111' })], {
        type: 'upsertChat',
        chat: { chatId: '1', name: 'Новое', phone: '7222' },
      });
      expect(state[0]).toMatchObject({ name: 'Старое', phone: '7111' });
    });

    it('возвращает то же состояние, если дополнять нечего', () => {
      const initial = [chat('1', { name: 'Имя' })];
      expect(chatsReducer(initial, { type: 'upsertChat', chat: { chatId: '1', name: 'Другое' } })).toBe(initial);
    });
  });

  describe('addMessage', () => {
    it('создаёт чат, если его ещё нет', () => {
      const state = chatsReducer([], {
        type: 'addMessage',
        chat: { chatId: '1', name: 'Имя' },
        message: message('a'),
        markUnread: true,
      });
      expect(state).toEqual([{ chatId: '1', name: 'Имя', phone: undefined, messages: [message('a')], unread: 1 }]);
    });

    it('поднимает чат наверх и считает непрочитанные', () => {
      const state = chatsReducer([chat('1'), chat('2')], {
        type: 'addMessage',
        chat: { chatId: '2' },
        message: message('a'),
        markUnread: true,
      });
      expect(state.map((c) => c.chatId)).toEqual(['2', '1']);
      expect(state[0]?.unread).toBe(1);
    });

    it('игнорирует дубликат по id', () => {
      const initial = [chat('1', { messages: [message('a')] })];
      expect(
        chatsReducer(initial, { type: 'addMessage', chat: { chatId: '1' }, message: message('a'), markUnread: true }),
      ).toBe(initial);
    });

    it('вставляет опоздавшее сообщение по времени', () => {
      const initial = [chat('1', { messages: [message('a', { timestamp: 10 }), message('c', { timestamp: 30 })] })];
      const state = chatsReducer(initial, {
        type: 'addMessage',
        chat: { chatId: '1' },
        message: message('b', { timestamp: 20 }),
        markUnread: false,
      });
      expect(state[0]?.messages.map((m) => m.id)).toEqual(['a', 'b', 'c']);
    });

    it('не трогает объекты других чатов', () => {
      const other = chat('1');
      const state = chatsReducer([other, chat('2')], {
        type: 'addMessage',
        chat: { chatId: '2' },
        message: message('a'),
        markUnread: false,
      });
      expect(state[1]).toBe(other);
    });
  });

  describe('confirmMessage', () => {
    const pending = [chat('1', { messages: [message('local-1', { direction: 'out', status: 'pending' })] })];

    it('меняет временный id на серверный и сохраняет ключ', () => {
      const state = chatsReducer(pending, {
        type: 'confirmMessage',
        chatId: '1',
        localId: 'local-1',
        id: 'srv-1',
        status: 'sent',
      });
      expect(state[0]?.messages[0]).toMatchObject({ id: 'srv-1', key: 'local-1', status: 'sent' });
    });

    it('применяет статус, пришедший раньше ответа', () => {
      const state = chatsReducer(pending, {
        type: 'confirmMessage',
        chatId: '1',
        localId: 'local-1',
        id: 'srv-1',
        status: 'read',
      });
      expect(state[0]?.messages[0]?.status).toBe('read');
    });

    it('убирает временное сообщение, если серверное уже есть', () => {
      const initial = [
        chat('1', {
          messages: [message('srv-1', { direction: 'out' }), message('local-1', { direction: 'out' })],
        }),
      ];
      const state = chatsReducer(initial, {
        type: 'confirmMessage',
        chatId: '1',
        localId: 'local-1',
        id: 'srv-1',
        status: 'sent',
      });
      expect(state[0]?.messages.map((m) => m.id)).toEqual(['srv-1']);
    });

    it('возвращает то же состояние, если временного сообщения нет', () => {
      expect(
        chatsReducer(pending, { type: 'confirmMessage', chatId: '1', localId: 'nope', id: 'x', status: 'sent' }),
      ).toBe(pending);
    });
  });

  describe('setStatus', () => {
    const sent = [chat('1'), chat('2', { messages: [message('m', { direction: 'out', status: 'sent' })] })];

    it('находит чат по chatId вида «номер@c.us»', () => {
      const withPhone = [
        chat('2', { phone: '79991234567', messages: [message('m', { direction: 'out', status: 'sent' })] }),
      ];
      const state = chatsReducer(withPhone, { type: 'setStatus', chatId: '79991234567@c.us', id: 'm', status: 'read' });
      expect(state[0]?.messages[0]?.status).toBe('read');
    });

    it('не трогает сообщение с тем же id в другом чате', () => {
      const initial = [
        chat('1', { messages: [message('m', { direction: 'out', status: 'sent' })] }),
        chat('2', { messages: [message('m', { direction: 'out', status: 'sent' })] }),
      ];
      const state = chatsReducer(initial, { type: 'setStatus', chatId: '2', id: 'm', status: 'read' });
      expect(state[0]).toBe(initial[0]);
      expect(state[1]?.messages[0]?.status).toBe('read');
    });

    it('игнорирует статус для неизвестного чата', () => {
      expect(chatsReducer(sent, { type: 'setStatus', chatId: 'x', id: 'm', status: 'read' })).toBe(sent);
    });

    it('не откатывает статус назад', () => {
      const read = chatsReducer(sent, { type: 'setStatus', chatId: '2', id: 'm', status: 'read' });
      expect(chatsReducer(read, { type: 'setStatus', chatId: '2', id: 'm', status: 'delivered' })).toBe(read);
    });

    it('сохраняет причину ошибки', () => {
      const state = chatsReducer(sent, { type: 'setStatus', chatId: '2', id: 'm', status: 'failed', error: 'лимит' });
      expect(state[1]?.messages[0]).toMatchObject({ status: 'failed', error: 'лимит' });
    });

    it('возвращает то же состояние для неизвестного сообщения', () => {
      expect(chatsReducer(sent, { type: 'setStatus', chatId: '2', id: 'nope', status: 'read' })).toBe(sent);
    });
  });

  describe('failLastOutgoing', () => {
    it('помечает ошибкой последнее неподтверждённое исходящее', () => {
      const initial = [
        chat('1', {
          messages: [
            message('a', { direction: 'out', status: 'sent' }),
            message('b', { direction: 'in' }),
            message('c', { direction: 'out', status: 'read' }),
          ],
        }),
      ];
      const state = chatsReducer(initial, { type: 'failLastOutgoing', chatId: '1', error: 'недоступен' });
      expect(state[0]?.messages.map((m) => m.status)).toEqual(['failed', undefined, 'read']);
      expect(state[0]?.messages[0]?.error).toBe('недоступен');
    });

    it('возвращает то же состояние, если подходящего сообщения нет', () => {
      const initial = [chat('1', { messages: [message('a', { direction: 'out', status: 'read' })] })];
      expect(chatsReducer(initial, { type: 'failLastOutgoing', chatId: '1' })).toBe(initial);
    });
  });

  describe('markRead', () => {
    it('обнуляет счётчик непрочитанных', () => {
      expect(chatsReducer([chat('1', { unread: 3 })], { type: 'markRead', chatId: '1' })[0]?.unread).toBe(0);
    });

    it('возвращает то же состояние без непрочитанных', () => {
      const initial = [chat('1')];
      expect(chatsReducer(initial, { type: 'markRead', chatId: '1' })).toBe(initial);
    });
  });
});
