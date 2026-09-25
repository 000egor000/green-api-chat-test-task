import type { Notification, QuotaNotification } from '../types';

export function isQuotaNotification(n: Notification): n is QuotaNotification {
  return n.typeWebhook === 'quotaExceeded';
}
