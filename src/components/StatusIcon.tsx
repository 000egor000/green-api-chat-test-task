import { MESSAGE_STATUS_TEXTS } from '../constants';
import type { MessageStatus } from '../types';

import styles from './StatusIcon.module.css';

interface Props {
  status?: MessageStatus;
  error?: string;
}

export function StatusIcon({ status, error }: Props) {
  if (status === 'failed') {
    return (
      <span className={styles.failed} title={error ?? MESSAGE_STATUS_TEXTS.failed}>
        {MESSAGE_STATUS_TEXTS.failedMark}
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <svg
        className={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg
      className={styles.icon}
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1.5 7.5l3.5 3.5 7-8" />
      {status === 'read' && <path d="M8 11l1 0 7-8" />}
    </svg>
  );
}
