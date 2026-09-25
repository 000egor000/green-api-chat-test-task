import type { MessageStatus } from '../../types';
import type { StatusNotification } from '../types';

export function toMessageStatus({ status }: StatusNotification): MessageStatus | null {
  switch (status) {
    case 'sent':
    case 'delivered':
    case 'read':
    case 'failed':
      return status;
    case 'noAccount':
    case 'notInGroup':
      return 'failed';
    default:
      return null;
  }
}
