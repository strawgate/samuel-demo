import type { ChatMessage } from './api';

const STORAGE_KEYS = {
  name: 'piestore_name',
  messages: 'piestore_messages',
} as const;

export function getStoredName(): string | null {
  return localStorage.getItem(STORAGE_KEYS.name);
}

export function setStoredName(name: string): void {
  localStorage.setItem(STORAGE_KEYS.name, name);
}

export function getStoredMessages(): ChatMessage[] {
  const raw = localStorage.getItem(STORAGE_KEYS.messages);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setStoredMessages(messages: ChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.name);
  localStorage.removeItem(STORAGE_KEYS.messages);
}
