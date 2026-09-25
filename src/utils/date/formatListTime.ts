import { LOCALE } from '../../constants';
import { formatTime } from './formatTime';
import { fromUnix } from './fromUnix';
import { isSameDay } from './isSameDay';

export function formatListTime(timestamp: number): string {
  const date = fromUnix(timestamp);
  return isSameDay(date, new Date())
    ? formatTime(timestamp)
    : date.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' });
}
