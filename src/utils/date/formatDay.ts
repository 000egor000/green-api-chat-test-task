import { DAY_TEXTS, LOCALE } from '../../constants';
import { isSameDay } from './isSameDay';

export function formatDay(date: Date): string {
  const day = new Date();
  if (isSameDay(date, day)) return DAY_TEXTS.today;
  day.setDate(day.getDate() - 1);
  if (isSameDay(date, day)) return DAY_TEXTS.yesterday;
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' });
}
