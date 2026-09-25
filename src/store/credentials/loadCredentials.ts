import type { Credentials } from '../../types';
import { readJson } from '../../utils';
import { credentialsStorageKey } from './credentialsStorageKey';

export function loadCredentials(): Credentials | null {
  const stored = readJson<Record<string, unknown> | null>(credentialsStorageKey(), null);
  const { idInstance, apiTokenInstance, apiUrl } = stored ?? {};
  if (typeof idInstance !== 'string' || typeof apiTokenInstance !== 'string' || typeof apiUrl !== 'string') return null;
  if (!idInstance || !apiTokenInstance || !apiUrl) return null;
  return { idInstance, apiTokenInstance, apiUrl };
}
