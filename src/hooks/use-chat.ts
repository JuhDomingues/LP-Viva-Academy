import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatApi } from '@/lib/chat-api';
import { getChatSession, saveChatSession } from '@/lib/chat-storage';
import type { Message } from '@/types/chat';

export function useChat() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session
    const existingSession = getChatSession();
    if (existingSession) {
      setSessionId(existingSession.sessionId);
      setMessages(existingSession.messages || []);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      saveChatSession({
        sessionId: newSessionId,
        messages: [],
        lastUpdated: new Date(),
      });
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !sessionId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage(sessionId, content);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        createdAt: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        saveChatSession({
          sessionId,
          messages: updated,
          lastUpdated: new Date(),
        });
        return updated;
      });

    } catch (err) {
      console.error('Failed to send message:', error);

      const errorMessage = err instanceof Error ? err.message : 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
      setError(errorMessage);

      const errorMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: errorMessage,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    saveChatSession({
      sessionId,
      messages: [],
      lastUpdated: new Date(),
    });
  }, [sessionId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    sessionId,
    unreadCount,
    error,
  };
}
