import type { MessageNotification, Notification } from '../types';

export function isMessageNotification(n: Notification): n is MessageNotification {
  return n.typeWebhook === 'incomingMessageReceived' || n.typeWebhook === 'outgoingMessageReceived';
}
