import type { Credentials } from '../../types';
import { request } from '../request';
import type { InstanceState } from '../types';

export function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: InstanceState }>(creds, 'getStateInstance');
}
