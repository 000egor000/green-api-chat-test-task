import { API_ERROR_TEXTS } from '../constants';
import type { Credentials } from '../types';
import { buildUrl } from './buildUrl';
import { GreenApiError } from './GreenApiError';
import { readErrorReason } from './readErrorReason';
import type { RequestOptions } from './types';

export async function request<T>(
  { apiUrl, idInstance, apiTokenInstance }: Credentials,
  apiMethod: string,
  { method = 'GET', body, query, pathSuffix, signal }: RequestOptions = {},
): Promise<T | null> {
  const suffix = pathSuffix ? `/${pathSuffix}` : '';
  const url = buildUrl(apiUrl, `waInstance${idInstance}/${apiMethod}/${apiTokenInstance}${suffix}`, query);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new GreenApiError(API_ERROR_TEXTS.network);
  }

  if (!response.ok) throw GreenApiError.fromResponse(response.status, await readErrorReason(response));

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GreenApiError(API_ERROR_TEXTS.invalidResponse, response.status);
  }
}
