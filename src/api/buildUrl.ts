import { API_ERROR_TEXTS } from '../constants';
import { GreenApiError } from './GreenApiError';
import type { RequestOptions } from './types';

export function buildUrl(apiUrl: string, path: string, query: RequestOptions['query']): URL {
  try {
    const url = new URL(`${apiUrl.replace(/\/+$/, '')}/${path}`);
    Object.entries(query ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    return url;
  } catch {
    throw new GreenApiError(API_ERROR_TEXTS.invalidApiUrl);
  }
}
