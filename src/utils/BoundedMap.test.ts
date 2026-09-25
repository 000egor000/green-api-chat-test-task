import { describe, expect, it } from 'vitest';

import { BoundedMap } from './BoundedMap';

describe('BoundedMap', () => {
  it('отдаёт значение один раз', () => {
    const map = new BoundedMap<string, number>(2);
    map.set('a', 1);
    expect(map.take('a')).toBe(1);
    expect(map.take('a')).toBeUndefined();
  });

  it('вытесняет самый старый ключ при переполнении', () => {
    const map = new BoundedMap<string, number>(2);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    expect(map.take('a')).toBeUndefined();
    expect(map.take('b')).toBe(2);
    expect(map.take('c')).toBe(3);
  });

  it('обновление ключа делает его самым свежим', () => {
    const map = new BoundedMap<string, number>(2);
    map.set('a', 1);
    map.set('b', 2);
    map.set('a', 10);
    map.set('c', 3);
    expect(map.take('a')).toBe(10);
    expect(map.take('b')).toBeUndefined();
  });
});
