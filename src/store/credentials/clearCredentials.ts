import { removeKey } from '../../utils';
import { credentialsStorageKey } from './credentialsStorageKey';

export function clearCredentials(): void {
  removeKey(credentialsStorageKey());
}
