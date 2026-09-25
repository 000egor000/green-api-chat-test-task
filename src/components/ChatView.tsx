import { Fragment, memo, useLayoutEffect, useMemo, useRef } from 'react';

import { CHAT_VIEW_TEXTS, ICON_PATHS } from '../constants';
import type { Chat } from '../types';
import { chatSubtitle, chatTitle, withDaySeparators } from '../utils';
import { Avatar } from './Avatar';
import { Composer } from './Composer';
import { IconButton } from './IconButton';
import { MessageBubble } from './MessageBubble';
import { Pill } from './Pill';
import { StrokeIcon } from './StrokeIcon';

import styles from './ChatView.module.css';

const STICK_TO_BOTTOM_PX = 120;

interface Props {
  chat: Chat;
  onSend: (text: string) => void;
  onBack: () => void;
}

export const ChatView = memo(function ChatView({ chat, onSend, onBack }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastKey = useRef<string | undefined>(undefined);
  const title = chatTitle(chat);
  const items = useMemo(() => withDaySeparators(chat.messages), [chat.messages]);

  useLayoutEffect(() => {
    stickToBottom.current = true;
    lastKey.current = undefined;
  }, [chat.chatId]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const last = chat.messages.at(-1);
    const isNewLast = last?.key !== lastKey.current;
    lastKey.current = last?.key;
    if (list && isNewLast && (stickToBottom.current || last?.direction === 'out')) {
      list.scrollTop = list.scrollHeight;
    }
  }, [chat.messages]);

  function handleScroll() {
    const list = listRef.current;
    if (list) stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < STICK_TO_BOTTOM_PX;
  }

  return (
    <section className={styles.chat}>
      <header className={styles.header}>
        <IconButton label={CHAT_VIEW_TEXTS.back} onClick={onBack} className={styles.back}>
          <StrokeIcon d={ICON_PATHS.back} />
        </IconButton>
        <Avatar title={title} seed={chat.chatId} size={42} />
        <div className={styles.headerText}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{chatSubtitle(chat)}</div>
        </div>
      </header>

      <div className={styles.messages} ref={listRef} onScroll={handleScroll}>
        <div className={styles.column}>
          {items.length === 0 && (
            <Pill className={styles.empty}>
              <div className={styles.emptyTitle}>{CHAT_VIEW_TEXTS.emptyTitle}</div>
              <div>{CHAT_VIEW_TEXTS.emptyHint}</div>
            </Pill>
          )}
          {items.map(({ message, separator }) => (
            <Fragment key={message.key}>
              {separator && (
                <div className={styles.day}>
                  <Pill>{separator}</Pill>
                </div>
              )}
              <MessageBubble message={message} />
            </Fragment>
          ))}
        </div>
      </div>

      <Composer key={chat.chatId} onSend={onSend} />
    </section>
  );
});
