import { MESSENGER_TEXTS } from '../../constants';
import type { StatusNotification } from '../types';

const UNRESOLVABLE = /unresolvable/i;

export function describeDeliveryError({ status, description }: StatusNotification): string | undefined {
  if (status === 'noAccount') return MESSENGER_TEXTS.noAccount;
  if (description && UNRESOLVABLE.test(description)) return MESSENGER_TEXTS.chatUnresolvable;
  return description || undefined;
}
