import { LOCALE } from '../../constants';
import { fromUnix } from './fromUnix';

export function formatTime(timestamp: number): string {
  return fromUnix(timestamp).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}
