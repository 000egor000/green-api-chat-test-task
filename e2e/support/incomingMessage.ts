export const incomingMessage = (chatId: string, text: string, sender = 'Василиса Премудрая') => ({
  typeWebhook: 'incomingMessageReceived',
  idMessage: `in-${Math.random().toString(36).slice(2)}`,
  timestamp: Math.floor(Date.now() / 1000),
  senderData: { chatId, senderName: sender, senderContactName: sender, senderPhoneNumber: 79991234567 },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
});
