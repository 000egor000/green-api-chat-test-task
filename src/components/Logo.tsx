import logoUrl from '../assets/telegram.svg';
import { APP_TEXTS } from '../constants';

interface Props {
  size?: number;
}

export function Logo({ size = 32 }: Props) {
  return <img src={logoUrl} width={size} height={size} alt={APP_TEXTS.brand} draggable={false} />;
}
