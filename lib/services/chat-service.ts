import { openaiClient } from '../ai/openai-client';
import { SYSTEM_PROMPT, getQualificationScore, shouldOfferSubscription, type LeadData } from '../ai/prompts';
import { db } from '../db/client';

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

  private async extractLeadData(conversationId: string, messages: any[]): Promise<LeadData> {
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n').toLowerCase();

    const leadData: LeadData = {
      total_messages: messages.filter(m => m.role === 'user').length,
    };

    // Simple extraction logic (could be enhanced with NLP)
    // Extract name
    const nameMatch = conversationText.match(/meu nome (?:é|eh) ([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (nameMatch) {
      leadData.name = nameMatch[1].trim();
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
