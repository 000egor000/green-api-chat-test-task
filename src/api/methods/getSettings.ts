import type { Credentials } from '../../types';
import { request } from '../request';
import type { InstanceSettings } from '../types';

export function getSettings(creds: Credentials) {
  return request<InstanceSettings>(creds, 'getSettings');
}
