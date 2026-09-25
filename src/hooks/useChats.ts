import { useEffect, useReducer, useRef } from 'react';

import { chatsReducer, loadChats, saveChats } from '../store';
import { useLatest } from './useLatest';

const SAVE_DEBOUNCE_MS = 500;

export function useChats(idInstance: string) {
  const [chats, dispatch] = useReducer(chatsReducer, idInstance, loadChats);
  const latest = useLatest(chats);
  const saved = useRef(chats);

  useEffect(() => {
    if (chats === saved.current) return;
    const timer = setTimeout(() => {
      saved.current = chats;
      saveChats(idInstance, chats);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [idInstance, chats]);

  useEffect(() => {
    const flush = () => {
      if (latest.current === saved.current) return;
      saved.current = latest.current;
      saveChats(idInstance, latest.current);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [idInstance, latest]);

  return [chats, dispatch] as const;
}
