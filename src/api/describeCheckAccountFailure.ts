import { INSTANCE_STATE_TEXTS, MESSENGER_TEXTS } from '../constants';
import type { CheckAccountResponse } from './types';

const RATE_LIMIT = /rate.?limit/i;
const NOT_AUTHORIZED = /starting|not authorized/i;

export function describeCheckAccountFailure(response: CheckAccountResponse | null): string | null {
  if (response?.status !== false) return null;
  const reason = response.data?.reason ?? response.reason ?? '';
  if (RATE_LIMIT.test(reason)) return MESSENGER_TEXTS.checkRateLimited;
  if (NOT_AUTHORIZED.test(reason)) return INSTANCE_STATE_TEXTS.notAuthorized;
  return MESSENGER_TEXTS.checkFailed;
}
