import type { Credentials } from '../../types';
import { request } from '../request';
import type { CheckAccountResponse } from '../types';

export function checkAccount(creds: Credentials, phoneNumber: string) {
  return request<CheckAccountResponse>(creds, 'checkAccount', {
    method: 'POST',
    body: { phoneNumber: Number(phoneNumber) },
  });
}
