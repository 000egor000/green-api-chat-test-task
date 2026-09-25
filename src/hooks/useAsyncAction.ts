import { useCallback, useState } from 'react';

import { userMessage } from '../utils';

export function useAsyncAction<A extends unknown[]>(action: (...args: A) => Promise<void>, fallbackError: string) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function run(...args: A): Promise<void> {
    setPending(true);
    setError('');
    try {
      await action(...args);
    } catch (caught) {
      setError(userMessage(caught, fallbackError));
    } finally {
      setPending(false);
    }
  }

  const resetError = useCallback(() => setError(''), []);

  return { run, pending, error, resetError };
}
