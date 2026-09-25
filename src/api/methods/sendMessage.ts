import type { Credentials } from '../../types';
import { request } from '../request';

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(creds, 'sendMessage', {
    method: 'POST',
    body: { chatId, message },
  });
}
