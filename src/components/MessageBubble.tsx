import { memo } from 'react';

import type { Message } from '../types';
import { cx, formatTime } from '../utils';
import { StatusIcon } from './StatusIcon';

import styles from './MessageBubble.module.css';

interface Props {
  message: Message;
}

export const MessageBubble = memo(function MessageBubble({ message }: Props) {
  const out = message.direction === 'out';
  return (
    <div className={cx(styles.bubble, out ? styles.out : styles.in)}>
      <span className={styles.text}>{message.text}</span>
      <span className={styles.meta}>
        {formatTime(message.timestamp)}
        {out && <StatusIcon status={message.status} error={message.error} />}
      </span>
    </div>
  );
});
