import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DAY_TEXTS } from '../../constants';
import type { Message } from '../../types';
import { withDaySeparators } from './withDaySeparators';

const at = (id: string, iso: string): Message => ({
  id,
  key: id,
  text: id,
  direction: 'in',
  timestamp: new Date(iso).getTime() / 1000,
});

describe('withDaySeparators', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T12:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('ставит разделитель только перед первым сообщением дня', () => {
    const items = withDaySeparators([
      at('a', '2026-09-20T10:00:00'),
      at('b', '2026-09-20T11:00:00'),
      at('c', '2026-09-24T09:00:00'),
      at('d', '2026-09-25T09:00:00'),
      at('e', '2026-09-25T10:00:00'),
    ]);
    expect(items.map((i) => i.separator)).toEqual(['20 сентября', null, DAY_TEXTS.yesterday, DAY_TEXTS.today, null]);
  });

  it('возвращает пустой список для пустого чата', () => {
    expect(withDaySeparators([])).toEqual([]);
  });
});
