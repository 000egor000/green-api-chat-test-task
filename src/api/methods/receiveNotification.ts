import type { Credentials } from '../../types';
import { request } from '../request';
import type { ReceivedNotification } from '../types';

const CLIENT_TIMEOUT_MARGIN_SEC = 10;

export function receiveNotification(creds: Credentials, receiveTimeout: number, signal: AbortSignal) {
  return request<ReceivedNotification>(creds, 'receiveNotification', {
    query: { receiveTimeout },
    signal: AbortSignal.any([signal, AbortSignal.timeout((receiveTimeout + CLIENT_TIMEOUT_MARGIN_SEC) * 1000)]),
  });
}
