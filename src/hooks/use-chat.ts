import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatApi } from '@/lib/chat-api';
import { getChatSession, saveChatSession } from '@/lib/chat-storage';
import type { Message, UserInfo } from '@/types/chat';

export function useChat() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Initialize session and load history
    const initializeChat = async () => {
      const existingSession = getChatSession();

      if (existingSession) {
        setSessionId(existingSession.sessionId);
        setUserInfo(existingSession.userInfo || null);

        // Try to load history from server
        setIsLoadingHistory(true);
        try {
          const history = await chatApi.getConversationHistory(existingSession.sessionId);

          if (history.messages && history.messages.length > 0) {
            // Server has messages - use them as source of truth
            const formattedMessages = history.messages.map((msg: Message) => ({
              ...msg,
              createdAt: new Date(msg.createdAt),
            }));
            setMessages(formattedMessages);

            // Update localStorage with server data
            saveChatSession({
              sessionId: existingSession.sessionId,
              messages: formattedMessages,
              lastUpdated: new Date(),
              userInfo: existingSession.userInfo,
            });
          } else {
            // No server history - use localStorage as fallback
            setMessages(existingSession.messages || []);
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
          // On error, use localStorage as fallback
          setMessages(existingSession.messages || []);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // New session
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        saveChatSession({
          sessionId: newSessionId,
          messages: [],
          lastUpdated: new Date(),
        });
      }
    };

    initializeChat();
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
      // Send message and optionally sync with WhatsApp if user provided phone
      const whatsappNumber = userInfo?.telefone;
      const response = await chatApi.sendMessage(sessionId, content, whatsappNumber);

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
          userInfo,
        });
        return updated;
      });

    } catch (err) {
      console.error('Failed to send message:', err);

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
  }, [sessionId, userInfo]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    saveChatSession({
      sessionId,
      messages: [],
      lastUpdated: new Date(),
      userInfo,
    });
  }, [sessionId, userInfo]);

  const saveUserInfo = useCallback((info: UserInfo) => {
    setUserInfo(info);
    saveChatSession({
      sessionId,
      messages,
      lastUpdated: new Date(),
      userInfo: info,
    });
  }, [sessionId, messages]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
    clearMessages,
    sessionId,
    unreadCount,
    error,
    userInfo,
    saveUserInfo,
  };
}
