import { useState, type FormEvent } from 'react';

import { ICON_PATHS, PHONE_DIGITS, SIDEBAR_TEXTS } from '../constants';
import { useAsyncAction } from '../hooks';
import type { Chat, ConnectionState } from '../types';
import { cx, onlyDigits } from '../utils';
import { ChatListItem } from './ChatListItem';
import { IconButton } from './IconButton';
import { Logo } from './Logo';
import { StrokeIcon } from './StrokeIcon';

import styles from './Sidebar.module.css';

interface Props {
  className?: string;
  chats: Chat[];
  activeChatId: string | null;
  connection: ConnectionState;
  notice: string | null;
  idInstance: string;
  onSelect: (chatId: string) => void;
  onCreateChat: (phone: string) => Promise<void>;
  onLogout: () => void;
}

export function Sidebar({
  className,
  chats,
  activeChatId,
  connection,
  notice,
  idInstance,
  onSelect,
  onCreateChat,
  onLogout,
}: Props) {
  const [phone, setPhone] = useState('');
  const createChat = useAsyncAction(async () => {
    await onCreateChat(phone);
    setPhone('');
  }, SIDEBAR_TEXTS.createChatError);

  const phoneValid = phone.length >= PHONE_DIGITS.min && phone.length <= PHONE_DIGITS.max;
  const connectionText = {
    online: SIDEBAR_TEXTS.instance(idInstance),
    offline: SIDEBAR_TEXTS.offline,
    unauthorized: SIDEBAR_TEXTS.unauthorized,
    webhookSet: SIDEBAR_TEXTS.webhookSet,
  }[connection];
  const problem = connection !== 'online' || notice !== null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (phoneValid && !createChat.pending) createChat.run();
  }

  return (
    <aside className={cx(styles.sidebar, className)}>
      <header className={styles.header}>
        <Logo />
        <div className={styles.headerText}>
          <div className={styles.appName}>{SIDEBAR_TEXTS.title}</div>
          <div className={cx(styles.status, problem && styles.offline)} aria-live="polite" title={notice ?? undefined}>
            {connection === 'online' && notice ? notice : connectionText}
          </div>
        </div>
        <IconButton label={SIDEBAR_TEXTS.logout} onClick={onLogout}>
          <StrokeIcon d={ICON_PATHS.logout} size={20} />
        </IconButton>
      </header>

      <form className={styles.newChat} onSubmit={handleSubmit}>
        <div className={styles.phoneInput}>
          <span>{SIDEBAR_TEXTS.phonePrefix}</span>
          <input
            value={phone}
            onChange={(event) => {
              setPhone(onlyDigits(event.target.value).slice(0, PHONE_DIGITS.max));
              createChat.resetError();
            }}
            placeholder={SIDEBAR_TEXTS.phonePlaceholder}
            inputMode="tel"
            aria-label={SIDEBAR_TEXTS.phoneLabel}
          />
        </div>
        <button className={styles.createButton} type="submit" disabled={!phoneValid || createChat.pending}>
          {createChat.pending ? SIDEBAR_TEXTS.creatingChat : SIDEBAR_TEXTS.createChat}
        </button>
      </form>
      {createChat.error && (
        <div className={styles.error} role="alert">
          {createChat.error}
        </div>
      )}

      <ul className={styles.list}>
        {chats.length === 0 && <li className={styles.empty}>{SIDEBAR_TEXTS.empty}</li>}
        {chats.map((chat) => (
          <ChatListItem key={chat.chatId} chat={chat} active={chat.chatId === activeChatId} onSelect={onSelect} />
        ))}
      </ul>
    </aside>
  );
}
