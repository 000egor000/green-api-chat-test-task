export type StoredMessage = Record<string, unknown> | null;

export type StoredChat = (Record<string, unknown> & { messages?: unknown }) | null;
