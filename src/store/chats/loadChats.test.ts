import { beforeEach, describe, expect, it } from 'vitest';

import { chatsStorageKey } from './chatsStorageKey';
import { loadChats } from './loadChats';
import { saveChats } from './saveChats';

const store = (value: unknown) => localStorage.setItem(chatsStorageKey('1'), JSON.stringify(value));
const valid = { id: 'b', key: 'b', text: 'ok', direction: 'in', timestamp: 1 };

describe('loadChats', () => {
  beforeEach(() => localStorage.clear());

  it('возвращает пустой список, если ничего не сохранено', () => {
    expect(loadChats('1')).toEqual([]);
  });

  it.each([
    ['повреждённый JSON', '{broken'],
    ['не массив', JSON.stringify({ chatId: '1' })],
  ])('возвращает пустой список: %s', (_, raw) => {
    localStorage.setItem(chatsStorageKey('1'), raw);
    expect(loadChats('1')).toEqual([]);
  });

  it('отбрасывает чаты без chatId и неполные сообщения', () => {
    store([
      null,
      { name: 'без id' },
      { chatId: 5 },
      {
        chatId: '6',
        name: 7,
        unread: 'x',
        messages: [null, { id: 'a' }, { ...valid, direction: 'sideways' }, { ...valid, timestamp: '1' }, valid],
      },
    ]);
    expect(loadChats('1')).toEqual([
      {
        chatId: '6',
        phone: undefined,
        name: undefined,
        unread: 0,
        messages: [{ ...valid, status: undefined, error: undefined }],
      },
    ]);
  });

  it('помечает неотправленные сообщения как failed и берёт id вместо ключа', () => {
    store([{ chatId: '1', messages: [{ id: 'a', text: 't', direction: 'out', timestamp: 1, status: 'pending' }] }]);
    expect(loadChats('1')[0]?.messages[0]).toMatchObject({ key: 'a', status: 'failed' });
  });

  it('игнорирует неизвестный статус', () => {
    store([{ chatId: '1', messages: [{ ...valid, status: 'weird' }] }]);
    expect(loadChats('1')[0]?.messages[0]?.status).toBeUndefined();
  });

  it('хранит историю отдельно для каждого инстанса', () => {
    store([{ chatId: '1' }]);
    expect(loadChats('2')).toEqual([]);
  });

  it('сохраняет не больше 500 последних сообщений на чат', () => {
    const messages = Array.from({ length: 510 }, (_, i) => ({ ...valid, id: String(i), key: String(i), timestamp: i }));
    saveChats('1', [{ chatId: '1', messages: messages as never, unread: 0 }]);
    const restored = loadChats('1')[0]?.messages ?? [];
    expect(restored).toHaveLength(500);
    expect(restored[0]?.id).toBe('10');
  });
});
