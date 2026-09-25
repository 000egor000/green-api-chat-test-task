import { MESSENGER_TEXTS } from '../constants';
import { useMessenger } from '../hooks';
import type { Credentials } from '../types';
import { cx } from '../utils';
import { ChatView } from './ChatView';
import { Pill } from './Pill';
import { Sidebar } from './Sidebar';

import styles from './Messenger.module.css';

interface Props {
  creds: Credentials;
  onLogout: () => void;
}

export function Messenger({ creds, onLogout }: Props) {
  const { chats, activeChat, connection, notice, selectChat, closeChat, createChat, send } = useMessenger(creds);

  return (
    <div className={cx(styles.layout, activeChat && styles.chatOpen)}>
      <Sidebar
        className={styles.sidebar}
        chats={chats}
        activeChatId={activeChat?.chatId ?? null}
        connection={connection}
        notice={notice}
        idInstance={creds.idInstance}
        onSelect={selectChat}
        onCreateChat={createChat}
        onLogout={onLogout}
      />
      <main className={styles.main}>
        {activeChat ? (
          <ChatView chat={activeChat} onSend={send} onBack={closeChat} />
        ) : (
          <div className={styles.placeholder}>
            <Pill>{MESSENGER_TEXTS.noChatSelected}</Pill>
          </div>
        )}
      </main>
    </div>
  );
}
