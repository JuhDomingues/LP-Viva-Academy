import type { ChatSession } from '@/types/chat';

const STORAGE_KEY = 'viva_academy_chat_session';
const MAX_MESSAGES_STORED = 50;

export function getChatSession(): ChatSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored) as ChatSession;

    // Convert date strings back to Date objects
    session.lastUpdated = new Date(session.lastUpdated);
    session.messages = session.messages.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    }));

    return session;
  } catch (error) {
    console.error('Error reading chat session from storage:', error);
    return null;
  }
}

export function saveChatSession(session: ChatSession): void {
  try {
    // Limit number of stored messages
    const limitedSession = {
      ...session,
      messages: session.messages.slice(-MAX_MESSAGES_STORED),
      lastUpdated: new Date(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSession));
  } catch (error) {
    console.error('Error saving chat session to storage:', error);
  }
}

export function clearChatSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chat session from storage:', error);
  }
}

export function updateChatState(state: { isOpen?: boolean; isMinimized?: boolean; unreadCount?: number }): void {
  try {
    const stateKey = 'viva_academy_chat_state';
    const current = localStorage.getItem(stateKey);
    const currentState = current ? JSON.parse(current) : {};

    localStorage.setItem(stateKey, JSON.stringify({
      ...currentState,
      ...state,
    }));
  } catch (error) {
    console.error('Error updating chat state:', error);
  }
}

export function getChatState() {
  try {
    const stateKey = 'viva_academy_chat_state';
    const stored = localStorage.getItem(stateKey);
    return stored ? JSON.parse(stored) : { isOpen: false, isMinimized: false, unreadCount: 0 };
  } catch (error) {
    console.error('Error getting chat state:', error);
    return { isOpen: false, isMinimized: false, unreadCount: 0 };
  }
}
