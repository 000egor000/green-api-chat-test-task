import { APP_TEXTS } from './appTexts';

export const MESSENGER_TEXTS = {
  noChatSelected: 'Выберите чат или создайте новый по номеру телефона',
  notRegistered: `У этого номера нет аккаунта ${APP_TEXTS.brand} или он скрыт настройками приватности`,
  checkRateLimited: 'Слишком частые проверки номеров — мессенджер просит подождать около двух часов',
  checkFailed: 'Не удалось проверить номер',
  chatUnresolvable: 'Получатель недоступен в текущей сессии — создайте чат по номеру заново',
  noAccount: `У получателя нет аккаунта ${APP_TEXTS.brand}`,
  quotaExceeded: 'Исчерпан лимит чатов на тарифе Developer — писать можно только в уже использованные чаты',
};
