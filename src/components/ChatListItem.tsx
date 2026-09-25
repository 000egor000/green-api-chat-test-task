import { memo } from 'react';

import { CHAT_LIST_ITEM_TEXTS } from '../constants';
import type { Chat } from '../types';
import { chatTitle, cx, formatListTime } from '../utils';
import { Avatar } from './Avatar';

import styles from './ChatListItem.module.css';

interface Props {
  chat: Chat;
  active: boolean;
  onSelect: (chatId: string) => void;
}

export const ChatListItem = memo(function ChatListItem({ chat, active, onSelect }: Props) {
  const last = chat.messages.at(-1);
  const title = chatTitle(chat);
  return (
    <li>
      <button
        className={cx(styles.item, active && styles.active)}
        onClick={() => onSelect(chat.chatId)}
        aria-current={active || undefined}
      >
        <Avatar title={title} seed={chat.chatId} />
        <div className={styles.itemBody}>
          <div className={styles.itemRow}>
            <span className={styles.itemTitle}>{title}</span>
            {last && <span className={styles.itemTime}>{formatListTime(last.timestamp)}</span>}
          </div>
          <div className={styles.itemRow}>
            <span className={styles.itemPreview}>
              {last
                ? `${last.direction === 'out' ? CHAT_LIST_ITEM_TEXTS.ownMessagePrefix : ''}${last.text}`
                : CHAT_LIST_ITEM_TEXTS.noMessages}
            </span>
            {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
          </div>
        </div>
      </button>
    </li>
  );
});
