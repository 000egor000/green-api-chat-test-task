import { memo, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import { COMPOSER_TEXTS, ICON_PATHS } from '../constants';

import styles from './Composer.module.css';

const MAX_LENGTH = 4096;

interface Props {
  onSend: (text: string) => void;
}

export const Composer = memo(function Composer({ onSend }: Props) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }, [draft]);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.inputWrap}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={COMPOSER_TEXTS.placeholder}
          aria-label={COMPOSER_TEXTS.inputLabel}
          rows={1}
          maxLength={MAX_LENGTH}
          autoFocus
        />
      </div>
      <button className={styles.send} type="submit" disabled={!draft.trim()} aria-label={COMPOSER_TEXTS.send}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d={ICON_PATHS.send} />
        </svg>
      </button>
    </form>
  );
});
