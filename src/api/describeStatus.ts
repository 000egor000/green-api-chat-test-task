import { API_ERROR_TEXTS } from '../constants';

const REASON_TEXTS: [RegExp, string][] = [
  [/webhook url is set/i, API_ERROR_TEXTS.webhookSet],
  [/starting/i, API_ERROR_TEXTS.instanceStarting],
  [/expired/i, API_ERROR_TEXTS.instanceExpired],
  [/deleted/i, API_ERROR_TEXTS.instanceDeleted],
];

export function describeStatus(status: number, reason?: string): string {
  const byReason = reason ? REASON_TEXTS.find(([pattern]) => pattern.test(reason))?.[1] : undefined;
  if (byReason) return byReason;
  switch (status) {
    case 400:
      return API_ERROR_TEXTS.badRequest;
    case 401:
    case 403:
      return API_ERROR_TEXTS.unauthorized;
    case 404:
      return API_ERROR_TEXTS.notFound;
    case 429:
      return API_ERROR_TEXTS.tooManyRequests;
    case 466:
      return API_ERROR_TEXTS.quotaExceeded;
    case 469:
      return API_ERROR_TEXTS.messengerRateLimit;
    default:
      return status >= 500 ? API_ERROR_TEXTS.serverUnavailable : API_ERROR_TEXTS.unknown(status);
  }
}
