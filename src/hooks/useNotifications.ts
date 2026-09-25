import { useEffect, useState } from 'react';

import { deleteNotification, GreenApiError, receiveNotification, type Notification } from '../api';
import type { ConnectionState, Credentials } from '../types';
import { invokeSafely, sleep } from '../utils';
import { useLatest } from './useLatest';

const RECEIVE_TIMEOUT_SEC = 20;
const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export function useNotifications(creds: Credentials, onNotification: (body: Notification) => void): ConnectionState {
  const [connection, setConnection] = useState<ConnectionState>('online');
  const handler = useLatest(onNotification);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      let backoff = MIN_BACKOFF_MS;
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(creds, RECEIVE_TIMEOUT_SEC, signal);
          setConnection('online');
          backoff = MIN_BACKOFF_MS;
          if (!notification?.receiptId) continue;
          const { body } = notification;
          if (body) invokeSafely(() => handler.current(body));
          await deleteNotification(creds, notification.receiptId, signal);
        } catch (error) {
          if (signal.aborted) return;
          if (error instanceof GreenApiError && (error.isUnauthorized || error.isWebhookSet)) {
            setConnection(error.isWebhookSet ? 'webhookSet' : 'unauthorized');
            return;
          }
          setConnection('offline');
          await sleep(backoff, signal);
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        }
      }
    })();

    return () => controller.abort();
  }, [creds, handler]);

  return connection;
}
