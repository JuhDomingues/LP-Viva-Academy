import { openaiClient } from '../ai/openai-client.js';
import { SYSTEM_PROMPT, getQualificationScore, shouldOfferSubscription, type LeadData } from '../ai/prompts.js';
import { db } from '../db/client.js';
import axios from 'axios';

interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
}

export interface ProcessMessageOptions {
  sessionId: string;
  conversationId: string;
  userMessage: string;
  channel: 'whatsapp' | 'web';
}

export interface ProcessMessageResult {
  response: string;
  conversationId: string;
  shouldTransferToHuman: boolean;
  shouldOfferSubscription: boolean;
  leadQualified: boolean;
}

export class ChatService {
  async processMessage(options: ProcessMessageOptions): Promise<ProcessMessageResult> {
    const { sessionId, conversationId, userMessage, channel } = options;

    try {
      // Save user message
      await db.saveMessage({
        conversationId,
        role: 'user',
        content: userMessage,
      });

      // Get conversation history
      const messages = await db.getConversationMessages(conversationId);

      // Build context for AI
      const conversationHistory = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      // Generate AI response
      const aiResponse = await openaiClient.createChatCompletion({
        messages: conversationHistory,
      });

      // Save assistant message
      await db.saveMessage({
        conversationId,
        role: 'assistant',
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
      });

      // Update conversation activity
      await db.updateConversationActivity(conversationId);

      // Analyze response for triggers
      const shouldTransferToHuman = this.detectHumanHandoffTriggers(userMessage, aiResponse.content);
      const messageCount = await db.getMessageCount(conversationId);

      // Extract lead data from conversation
      const leadData = await this.extractLeadData(conversationId, messages);
      const shouldOffer = shouldOfferSubscription(leadData);
      const qualificationScore = getQualificationScore(leadData);
      const leadQualified = qualificationScore >= 70;

      // Update or create lead if we have enough data
      if (leadData.name || leadData.budget_range) {
        await this.updateOrCreateLead(sessionId, conversationId, leadData, qualificationScore, leadQualified);
      }

      // Track analytics
      await db.trackChatEvent({
        eventType: 'message_processed',
        sessionId,
        conversationId,
        properties: {
          channel,
          messageLength: userMessage.length,
          tokensUsed: aiResponse.tokensUsed,
          qualificationScore,
        },
      });

      return {
        response: aiResponse.content,
        conversationId,
        shouldTransferToHuman,
        shouldOfferSubscription: shouldOffer,
        leadQualified,
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private detectHumanHandoffTriggers(userMessage: string, aiResponse: string): boolean {
    const handoffKeywords = [
      'falar com consultor',
      'falar com humano',
      'atendente',
      'pessoa real',
      'alguém da equipe',
      'não entendi',
      'problema com assinatura',
      'já sou assinante',
      'reclamação',
      'cancelar',
    ];

    const lowerMessage = userMessage.toLowerCase();
    return handoffKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async extractLeadData(conversationId: string, messages: ConversationMessage[]): Promise<LeadData> {
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const conversationLower = conversationText.toLowerCase();

    const leadData: LeadData = {
      total_messages: messages.filter(m => m.role === 'user').length,
    };

    // Enhanced extraction with multiple patterns

    // Extract name (múltiplos padrões) - CASE INSENSITIVE
    const namePatterns = [
      /(?:meu nome (?:é|eh|e)|me chamo|sou (?:o|a)?\s+)([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+)+)/i,
      /user:\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+)/i,
      /^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+)$/im,
    ];

    for (const pattern of namePatterns) {
      const match = conversationText.match(pattern);
      if (match && match[1]) {
        const possibleName = match[1].trim();
        // Validate it's actually a name (2+ words, not email, not phone)
        if (possibleName.split(/\s+/).length >= 2 &&
            !possibleName.includes('@') &&
            !/^\d+$/.test(possibleName)) {
          leadData.name = possibleName;
          console.log('✅ Nome extraído:', possibleName);
          break;
        }
      }
    }

    if (!leadData.name) {
      console.log('⚠️  Nome não extraído');
    }

    // Extract email
    const emailPattern = /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})\b/;
    const emailMatch = conversationText.match(emailPattern);
    let extractedEmail: string | undefined;
    if (emailMatch) {
      extractedEmail = emailMatch[1].toLowerCase();
    }

    // Extract phone (padrões brasileiros)
    const phonePatterns = [
      /(?:telefone|celular|whats|número)?\s*(?:\+?55)?\s*\(?(\d{2})\)?\s*(\d{4,5})[-\s]?(\d{4})/i,
      /\b(\d{2})\s*(\d{4,5})[-\s]?(\d{4})\b/,
      /\b(\d{11})\b/, // 11987654321
    ];

    let extractedPhone: string | undefined;
    for (const pattern of phonePatterns) {
      const match = conversationText.match(pattern);
      if (match) {
        if (match.length === 4) {
          extractedPhone = `${match[1]}${match[2]}${match[3]}`;
        } else {
          extractedPhone = match[1].replace(/\D/g, '');
        }
        break;
      }
    }

    // Extract budget
    const budgetMatch = conversationText.match(/r\$?\s?(\d+\.?\d*)/i);
    if (budgetMatch) {
      leadData.budget_range = `R$ ${budgetMatch[1]}`;
    }

    // Extract timeline keywords
    if (conversationText.includes('urgente') || conversationText.includes('rápido') || conversationText.includes('logo')) {
      leadData.timeline = 'curto';
    } else if (conversationText.includes('médio prazo') || conversationText.includes('ano que vem')) {
      leadData.timeline = 'médio';
    } else if (conversationText.includes('longo prazo') || conversationText.includes('futuro')) {
      leadData.timeline = 'longo';
    }

    // Extract family situation
    if (conversationText.includes('casado') || conversationText.includes('casada') || conversationText.includes('esposa') || conversationText.includes('marido')) {
      leadData.family_situation = conversationText.includes('filho') ? 'Casado(a) com filhos' : 'Casado(a)';
    } else if (conversationText.includes('solteiro') || conversationText.includes('solteira')) {
      leadData.family_situation = 'Solteiro(a)';
    }

    // Extract immigration goals
    if (conversationText.includes('trabalh')) {
      leadData.immigration_goals = 'Trabalho';
    } else if (conversationText.includes('estud')) {
      leadData.immigration_goals = 'Estudo';
    } else if (conversationText.includes('invest')) {
      leadData.immigration_goals = 'Investimento';
    }

    // Send to Mautic if we have complete contact data (WhatsApp integration)
    console.log('🔍 Extracted lead data:', {
      name: leadData.name,
      email: extractedEmail,
      phone: extractedPhone,
      hasAllData: !!(extractedEmail && extractedPhone && leadData.name),
    });

    if (extractedEmail && extractedPhone && leadData.name) {
      console.log('✅ All contact data extracted, sending to Mautic...');
      await this.sendToMautic({
        nome: leadData.name,
        email: extractedEmail,
        telefone: extractedPhone,
      }).catch(error => {
        // Log but don't fail if Mautic integration fails
        console.error('❌ Failed to send to Mautic:', error);
      });
    } else {
      console.log('⚠️  Missing contact data, not sending to Mautic');
    }

    return leadData;
  }

  private async sendToMautic(data: { nome: string; email: string; telefone: string }): Promise<void> {
    try {
      // Use Vercel URL directly (internal API call)
      const API_URL = 'https://www.vivaacademy.app/api';

      // Format phone number correctly
      const phoneNumber = data.telefone.replace(/\D/g, ''); // Remove non-digits
      const formattedPhone = phoneNumber.startsWith('55') ? `+${phoneNumber}` : `+55${phoneNumber}`;

      console.log('📤 Sending to Mautic:', {
        nome: data.nome,
        email: data.email,
        telefone: formattedPhone.substring(0, 7) + '...'
      });

      const response = await axios.post(`${API_URL}/mautic`, {
        nome: data.nome,
        email: data.email,
        telefone: formattedPhone,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Mautic integration successful:', response.data);
    } catch (error: any) {
      console.error('❌ Mautic integration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  private async updateOrCreateLead(
    sessionId: string,
    conversationId: string,
    leadData: LeadData,
    qualificationScore: number,
    isQualified: boolean
  ) {
    const existingLead = await db.getLeadByConversationId(conversationId);

    if (existingLead) {
      // Update existing lead
      await db.updateLead(existingLead.id, {
        name: leadData.name,
        familySituation: leadData.family_situation,
        immigrationGoals: leadData.immigration_goals,
        budgetRange: leadData.budget_range,
        timeline: leadData.timeline,
        qualificationScore,
        isQualified,
      });
    } else {
      // Create new lead
      await db.createLead({
        sessionId,
        conversationId,
        name: leadData.name,
        familySituation: leadData.family_situation,
        immigrationGoals: leadData.immigration_goals,
        budgetRange: leadData.budget_range,
        timeline: leadData.timeline,
        qualificationScore,
        isQualified,
      });
    }
  }

  async getOrCreateSession(identifier: string, channel: 'whatsapp' | 'web') {
    let session;

    if (channel === 'whatsapp') {
      session = await db.getSessionByPhone(identifier);
    } else {
      session = await db.getSessionById(identifier);
    }

    if (!session) {
      session = await db.createSession({
        channel,
        phoneNumber: channel === 'whatsapp' ? identifier : null,
        sessionId: channel === 'web' ? identifier : null,
      });
    }

    return session;
  }

  async getOrCreateConversation(sessionId: string) {
    let conversation = await db.getActiveConversation(sessionId);

    if (!conversation) {
      conversation = await db.createConversation({ sessionId });
    }

    return conversation;
  }
}

export const chatService = new ChatService();
