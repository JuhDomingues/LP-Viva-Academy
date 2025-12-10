import axios from 'axios';
import type { SendMessageResponse } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ChatAPI {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds to match backend
  });

  async sendMessage(sessionId: string, message: string): Promise<SendMessageResponse> {
    try {
      const response = await this.client.post<SendMessageResponse>('/chat', {
        sessionId,
        message,
      });

      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);

      if (axios.isAxiosError(error) && error.response?.status === 429) {
        throw new Error('Você está enviando mensagens muito rapidamente. Por favor, aguarde um momento.');
      }

      throw new Error('Falha ao enviar mensagem. Por favor, tente novamente.');
    }
  }

  async getConversationHistory(sessionId: string) {
    try {
      const response = await this.client.get(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  }
}

export const chatApi = new ChatAPI();
