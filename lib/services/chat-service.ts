import { openaiClient } from '../ai/openai-client.js';
import { getSystemPrompt, getQualificationScore, shouldOfferSubscription, type LeadData } from '../ai/prompts.js';
import { db } from '../db/client.js';

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

      // Build context for AI with channel-specific prompt
      let systemPrompt: string;
      try {
        systemPrompt = getSystemPrompt(channel);
      } catch (error) {
        console.error('Error getting system prompt, using default:', error);
        systemPrompt = getSystemPrompt('web'); // fallback to web prompt
      }

      const conversationHistory = [
        { role: 'system' as const, content: systemPrompt },
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

      // Update or create lead if we have any meaningful data
      if (leadData.name || leadData.email || leadData.phone || leadData.budget_range) {
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

    // Extract name (múltiplos padrões)
    const namePatterns = [
      /(?:meu nome (?:é|eh|e)|me chamo|sou (?:o|a)?) ([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+)+)/,
      /^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+)+)$/m,
    ];

    for (const pattern of namePatterns) {
      const match = conversationText.match(pattern);
      if (match && match[1]) {
        leadData.name = match[1].trim();
        break;
      }
    }

    // Extract email (padrões melhorados)
    const emailPattern = /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})\b/;
    const emailMatch = conversationText.match(emailPattern);
    if (emailMatch) {
      leadData.email = emailMatch[1].toLowerCase();
    }

    // Extract phone (padrões brasileiros e internacionais)
    const phonePatterns = [
      /(?:telefone|celular|whats|número)?\s*(?:\+?55)?\s*\(?(\d{2})\)?\s*(\d{4,5})[-\s]?(\d{4})/i,
      /\b(\d{2})\s*(\d{4,5})[-\s]?(\d{4})\b/,
      /\b(\d{11})\b/, // 11987654321
    ];

    for (const pattern of phonePatterns) {
      const match = conversationText.match(pattern);
      if (match) {
        if (match.length === 4) {
          // Formato (11) 98765-4321
          leadData.phone = `${match[1]}${match[2]}${match[3]}`;
        } else {
          // Formato direto
          leadData.phone = match[1].replace(/\D/g, '');
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

    return leadData;
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
        email: leadData.email,
        phone: leadData.phone,
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
        email: leadData.email,
        phone: leadData.phone,
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
