import type { InstanceState } from '../../api';
import { APP_TEXTS } from './appTexts';

export const INSTANCE_STATE_TEXTS: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized: `Инстанс не авторизован — привяжите аккаунт ${APP_TEXTS.brand} в личном кабинете GREEN-API`,
  blocked: 'Аккаунт заблокирован',
  suspended: 'Отправка сообщений временно ограничена',
  starting: 'Инстанс запускается, это может занять до 5 минут',
  pendingPassword: 'Требуется пароль двухфакторной аутентификации — завершите авторизацию в личном кабинете GREEN-API',
};
