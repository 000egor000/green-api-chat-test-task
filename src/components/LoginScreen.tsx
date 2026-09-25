import { useState, type FormEvent } from 'react';

import { guessApiUrl, verifyInstance } from '../api';
import { LOGIN_TEXTS } from '../constants';
import { useAsyncAction } from '../hooks';
import type { Credentials } from '../types';
import { onlyDigits } from '../utils';
import { Logo } from './Logo';

import styles from './LoginScreen.module.css';

interface Props {
  onLogin: (creds: Credentials) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState<string | null>(null);
  const apiUrl = customApiUrl ?? guessApiUrl(idInstance);
  const creds: Credentials = { idInstance, apiTokenInstance: apiTokenInstance.trim(), apiUrl: apiUrl.trim() };

  const login = useAsyncAction(async () => {
    await verifyInstance(creds);
    onLogin(creds);
  }, LOGIN_TEXTS.fallbackError);

  const canSubmit = Boolean(creds.idInstance && creds.apiTokenInstance && creds.apiUrl) && !login.pending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (canSubmit) login.run();
  }

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <Logo size={120} />
          <h1 className={styles.title}>{LOGIN_TEXTS.title}</h1>
          <p className={styles.subtitle}>{LOGIN_TEXTS.subtitle}</p>
        </div>

        <label className={styles.field}>
          <span>{LOGIN_TEXTS.idInstanceLabel}</span>
          <input
            value={idInstance}
            onChange={(event) => setIdInstance(onlyDigits(event.target.value))}
            placeholder={LOGIN_TEXTS.idInstancePlaceholder}
            inputMode="numeric"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>{LOGIN_TEXTS.apiTokenLabel}</span>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            placeholder={LOGIN_TEXTS.apiTokenPlaceholder}
            autoComplete="off"
          />
        </label>

        <label className={styles.field}>
          <span>{LOGIN_TEXTS.apiUrlLabel}</span>
          <input
            value={apiUrl}
            onChange={(event) => setCustomApiUrl(event.target.value)}
            placeholder={LOGIN_TEXTS.apiUrlPlaceholder}
          />
          <span className={styles.hint}>{LOGIN_TEXTS.apiUrlHint}</span>
        </label>

        {login.error && (
          <div className={styles.error} role="alert">
            {login.error}
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={!canSubmit}>
          {login.pending ? LOGIN_TEXTS.submitting : LOGIN_TEXTS.submit}
        </button>
      </form>
    </div>
  );
}
