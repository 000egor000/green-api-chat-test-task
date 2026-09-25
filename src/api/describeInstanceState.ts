import { INSTANCE_STATE_TEXTS, LOGIN_TEXTS } from '../constants';

export function describeInstanceState(state: string): string {
  const known = Object.entries(INSTANCE_STATE_TEXTS).find(([key]) => key === state)?.[1];
  return known ?? LOGIN_TEXTS.unknownState(state);
}
