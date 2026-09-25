import { GREEN_API_DEFAULT_URL } from '../greenApi';
import { APP_TEXTS } from './appTexts';

export const LOGIN_TEXTS = {
  title: `Вход в ${APP_TEXTS.brand}`,
  subtitle: 'Введите данные инстанса из личного кабинета GREEN-API',
  idInstanceLabel: 'idInstance',
  idInstancePlaceholder: '4100000000',
  apiTokenLabel: 'apiTokenInstance',
  apiTokenPlaceholder: 'd75b3a66374942c5b3c019c698abc2067e151558acbd412345',
  apiUrlLabel: 'apiUrl',
  apiUrlPlaceholder: GREEN_API_DEFAULT_URL,
  submit: 'Войти',
  submitting: 'Подключение…',
  fallbackError: 'Не удалось подключиться',
  unknownState: (state: string) => `Состояние инстанса: ${state}`,
  apiUrlHint: 'Скопируйте apiUrl из личного кабинета GREEN-API',
  wrongInstanceType: (type: string) => `Это инстанс ${type}, а нужен ${APP_TEXTS.brand}`,
  incomingDisabled:
    'В настройках инстанса выключены входящие уведомления — включите «Получать уведомления о входящих сообщениях»',
};
