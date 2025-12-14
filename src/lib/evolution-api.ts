import axios, { AxiosInstance } from 'axios';

interface EvolutionConfig {
  baseURL: string;
  apiKey: string;
  instanceName: string;
}

interface SendTextMessageParams {
  number: string;
  text: string;
}

interface SendTextMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation: string;
  };
  messageTimestamp: number;
  status: string;
}

interface WebhookMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  pushName: string;
}

export class EvolutionAPI {
  private client: AxiosInstance;
  private instanceName: string;

  constructor(config: EvolutionConfig) {
    this.instanceName = config.instanceName;
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey,
      },
      timeout: 30000,
    });
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(params: SendTextMessageParams): Promise<SendTextMessageResponse> {
    try {
      const response = await this.client.post(
        `/message/sendText/${this.instanceName}`,
        {
          number: params.number,
          text: params.text,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Evolution API - Send message error:', error);
      throw new Error('Falha ao enviar mensagem via WhatsApp');
    }
  }

  /**
   * Get instance connection status
   */
  async getInstanceStatus(): Promise<{ state: string; qrcode?: string }> {
    try {
      const response = await this.client.get(`/instance/connectionState/${this.instanceName}`);
      return response.data;
    } catch (error) {
      console.error('Evolution API - Get status error:', error);
      throw error;
    }
  }

  /**
   * Set webhook URL for receiving messages
   */
  async setWebhook(webhookUrl: string): Promise<void> {
    try {
      await this.client.post(`/webhook/set/${this.instanceName}`, {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: true,
        events: [
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'CONNECTION_UPDATE',
        ],
      });
    } catch (error) {
      console.error('Evolution API - Set webhook error:', error);
      throw error;
    }
  }

  /**
   * Format phone number to WhatsApp format (5511999999999)
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // If it doesn't have country code, add Brazil (55)
    if (!cleaned.startsWith('55')) {
      return `55${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Extract message text from webhook payload
   */
  static extractMessageText(message: WebhookMessage): string | null {
    if (message.message.conversation) {
      return message.message.conversation;
    }

    if (message.message.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }

    return null;
  }

  /**
   * Check if message is from user (not sent by bot)
   */
  static isUserMessage(message: WebhookMessage): boolean {
    return !message.key.fromMe;
  }
}

// Singleton instance
let evolutionApiInstance: EvolutionAPI | null = null;

export function getEvolutionAPI(): EvolutionAPI {
  if (!evolutionApiInstance) {
    const config: EvolutionConfig = {
      baseURL: import.meta.env.EVOLUTION_API_URL || 'https://chat.layermarketing.com.br',
      apiKey: import.meta.env.EVOLUTION_API_KEY || '',
      instanceName: import.meta.env.EVOLUTION_INSTANCE_NAME || 'Viva_academy',
    };

    evolutionApiInstance = new EvolutionAPI(config);
  }

  return evolutionApiInstance;
}
