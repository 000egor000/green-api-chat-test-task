import { UserError } from '../utils';
import { describeStatus } from './describeStatus';

const WEBHOOK_SET = /webhook url is set/i;

export class GreenApiError extends UserError {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly reason?: string,
  ) {
    super(message);
    this.name = 'GreenApiError';
  }

  static fromResponse(status: number, reason?: string): GreenApiError {
    return new GreenApiError(describeStatus(status, reason), status, reason);
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isWebhookSet(): boolean {
    return WEBHOOK_SET.test(this.reason ?? '');
  }
}
