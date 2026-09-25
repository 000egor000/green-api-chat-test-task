import { UserError } from './UserError';

export function userMessage(error: unknown, fallback: string): string {
  return error instanceof UserError ? error.message : fallback;
}
