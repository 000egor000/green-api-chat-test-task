import { API_ERROR_TEXTS, INSTANCE_TYPE, LOGIN_TEXTS } from '../constants';
import type { Credentials } from '../types';
import { UserError } from '../utils';
import { describeInstanceState } from './describeInstanceState';
import { getSettings } from './methods/getSettings';
import { getStateInstance } from './methods/getStateInstance';

export async function verifyInstance(creds: Credentials): Promise<void> {
  const state = (await getStateInstance(creds))?.stateInstance;
  if (!state) throw new UserError(API_ERROR_TEXTS.emptyResponse);
  if (state !== 'authorized') throw new UserError(describeInstanceState(state));

  const settings = await getSettings(creds);
  if (settings?.typeInstance && settings.typeInstance !== INSTANCE_TYPE) {
    throw new UserError(LOGIN_TEXTS.wrongInstanceType(settings.typeInstance));
  }
  if (settings?.webhookUrl) throw new UserError(API_ERROR_TEXTS.webhookSet);
  if (settings?.incomingWebhook === 'no') throw new UserError(LOGIN_TEXTS.incomingDisabled);
}
