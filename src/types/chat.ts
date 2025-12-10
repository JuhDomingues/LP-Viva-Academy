export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  lastUpdated: Date;
}

export interface SendMessageResponse {
  response: string;
  conversationId: string;
  suggestions?: string[] | null;
  leadQualified?: boolean;
}

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
}
