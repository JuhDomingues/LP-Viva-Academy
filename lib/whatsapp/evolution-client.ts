import axios, { AxiosInstance } from 'axios';

export interface SendMessageOptions {
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
}

export interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
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
      imageMessage?: {
        url: string;
        caption?: string;
      };
    };
    messageTimestamp: number;
    pushName: string;
  };
}

export class EvolutionClient {
  private client: AxiosInstance;
  private instanceName: string;

  constructor() {
    this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || '';
    this.client = axios.create({
      baseURL: process.env.EVOLUTION_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_API_KEY || '',
      },
      timeout: 30000, // 30 seconds timeout
    });
  }

  async sendTextMessage(options: SendMessageOptions): Promise<void> {
    const { phoneNumber, message } = options;

    try {
      await this.client.post(`/message/sendText/${this.instanceName}`, {
        number: phoneNumber,
        text: message,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw new Error('WhatsApp message send failed');
    }
  }

  async sendMediaMessage(options: SendMessageOptions): Promise<void> {
    const { phoneNumber, message, mediaUrl } = options;

    if (!mediaUrl) {
      throw new Error('Media URL is required');
    }

    try {
      await this.client.post(`/message/sendMedia/${this.instanceName}`, {
        number: phoneNumber,
        mediatype: 'image', // Can be extended for other types
        media: mediaUrl,
        caption: message,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp media:', error);
      throw new Error('WhatsApp media send failed');
    }
  }

  async setPresence(phoneNumber: string, presence: 'composing' | 'recording' | 'available'): Promise<void> {
    try {
      await this.client.post(`/chat/sendPresence/${this.instanceName}`, {
        number: phoneNumber,
        presence,
      });
    } catch (error) {
      // Non-critical, just log
      console.error('Failed to set presence:', error);
    }
  }

  extractMessage(payload: EvolutionWebhookPayload): { text: string; phoneNumber: string } | null {
    const { data } = payload;

    // Ignore messages sent by bot
    if (data.key.fromMe) {
      return null;
    }

    const phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
    let text = '';

    if (data.message.conversation) {
      text = data.message.conversation;
    } else if (data.message.extendedTextMessage?.text) {
      text = data.message.extendedTextMessage.text;
    } else if (data.message.imageMessage?.caption) {
      text = data.message.imageMessage.caption;
    }

    return text ? { text, phoneNumber } : null;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get(`/instance/connectionState/${this.instanceName}`);
      return response.data.state === 'open';
    } catch (error) {
      console.error('EvolutionAPI health check failed:', error);
      return false;
    }
  }
}

export const evolutionClient = new EvolutionClient();
