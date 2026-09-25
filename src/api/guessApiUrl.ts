import { GREEN_API_DEFAULT_URL } from '../constants';

const INSTANCE_ID = /^\d{10}$/;

export function guessApiUrl(idInstance: string): string {
  return INSTANCE_ID.test(idInstance) ? `https://${idInstance.slice(0, 4)}.api.green-api.com` : GREEN_API_DEFAULT_URL;
}
