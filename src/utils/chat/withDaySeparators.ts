import type { Message, MessageListItem } from '../../types';
import { formatDay } from '../date/formatDay';
import { fromUnix } from '../date/fromUnix';

export function withDaySeparators(messages: Message[]): MessageListItem[] {
  let prevDay = '';
  return messages.map((message) => {
    const date = fromUnix(message.timestamp);
    const day = date.toDateString();
    const separator = day === prevDay ? null : formatDay(date);
    prevDay = day;
    return { message, separator };
  });
}
