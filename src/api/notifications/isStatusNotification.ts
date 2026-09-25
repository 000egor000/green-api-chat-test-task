import type { Notification, StatusNotification } from '../types';

export function isStatusNotification(n: Notification): n is StatusNotification {
  return n.typeWebhook === 'outgoingMessageStatus';
}
