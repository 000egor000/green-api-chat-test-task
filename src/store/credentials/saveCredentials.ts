import type { Credentials } from '../../types';
import { writeJson } from '../../utils';
import { credentialsStorageKey } from './credentialsStorageKey';

export function saveCredentials(creds: Credentials): void {
  writeJson(credentialsStorageKey(), creds);
}
