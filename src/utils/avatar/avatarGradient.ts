import { AVATAR_GRADIENTS } from '../../constants';

const FALLBACK: readonly [string, string] = ['#4fc3f7', '#1e88e5'];

export function avatarGradient(seed: string): string {
  const hash = [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
  const [from, to] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length] ?? FALLBACK;
  return `linear-gradient(135deg, ${from}, ${to})`;
}
