import { useCallback, useState } from 'react';

import { clearCredentials, loadCredentials, saveCredentials } from '../store';
import type { Credentials } from '../types';

export function useCredentials() {
  const [creds, setCreds] = useState(loadCredentials);

  const login = useCallback((next: Credentials) => {
    saveCredentials(next);
    setCreds(next);
  }, []);

  const logout = useCallback(() => {
    clearCredentials();
    setCreds(null);
  }, []);

  return { creds, login, logout };
}
