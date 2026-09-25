import type { Notification, StateNotification } from '../types';

export function isStateNotification(n: Notification): n is StateNotification {
  return n.typeWebhook === 'stateInstanceChanged';
}
