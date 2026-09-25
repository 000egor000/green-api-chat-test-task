import { describe, expect, it } from 'vitest';

import type { Message } from '../../types';
import { insertMessage } from './insertMessage';

const at = (id: string, timestamp: number): Message => ({ id, key: id, text: id, direction: 'in', timestamp });

describe('insertMessage', () => {
  it('добавляет в конец, если сообщение новее всех', () => {
    expect(insertMessage([at('a', 1)], at('b', 2)).map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('вставляет по времени', () => {
    expect(insertMessage([at('a', 1), at('c', 3)], at('b', 2)).map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('сохраняет порядок прихода при равном времени', () => {
    expect(insertMessage([at('a', 1)], at('b', 1)).map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('не мутирует исходный массив', () => {
    const messages = [at('a', 1)];
    insertMessage(messages, at('b', 2));
    expect(messages).toHaveLength(1);
  });
});
