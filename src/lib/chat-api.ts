import axios from 'axios';
import type { SendMessageResponse } from '@/types/chat';
import { getEvolutionAPI, EvolutionAPI } from './evolution-api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ChatAPI {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds to match backend
  });

  async sendMessage(sessionId: string, message: string, whatsappNumber?: string): Promise<SendMessageResponse> {
    try {
      const response = await this.client.post<SendMessageResponse>('/chat', {
        sessionId,
        message,
      });

      // If WhatsApp number is provided, also send via WhatsApp
      if (whatsappNumber && response.data.response) {
        try {
          const evolutionAPI = getEvolutionAPI();
          const formattedNumber = EvolutionAPI.formatPhoneNumber(whatsappNumber);

          await evolutionAPI.sendTextMessage({
            number: formattedNumber,
            text: response.data.response,
          });
        } catch (whatsappError) {
          console.error('Failed to send WhatsApp message:', whatsappError);
          // Don't throw error - the chat message was sent successfully
        }
      }

      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);

      if (axios.isAxiosError(error) && error.response?.status === 429) {
        throw new Error('Você está enviando mensagens muito rapidamente. Por favor, aguarde um momento.');
      }

      throw new Error('Falha ao enviar mensagem. Por favor, tente novamente.');
    }
  }

  async sendToWhatsApp(phoneNumber: string, message: string): Promise<void> {
    try {
      const evolutionAPI = getEvolutionAPI();
      const formattedNumber = EvolutionAPI.formatPhoneNumber(phoneNumber);

      await evolutionAPI.sendTextMessage({
        number: formattedNumber,
        text: message,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw new Error('Falha ao enviar mensagem via WhatsApp. Verifique o número e tente novamente.');
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
