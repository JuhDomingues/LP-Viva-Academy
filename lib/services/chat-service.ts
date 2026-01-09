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
  phoneNumber?: string; // WhatsApp phone number from session (if available)
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
    const { sessionId, conversationId, userMessage, channel, phoneNumber } = options;

    console.log('📥 Processing message:', {
      channel,
      hasPhoneNumber: !!phoneNumber,
      phonePreview: phoneNumber ? phoneNumber.substring(0, 5) + '...' : 'N/A',
    });

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
      const leadData = await this.extractLeadData(conversationId, messages, phoneNumber);
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

  private async extractLeadData(conversationId: string, messages: ConversationMessage[], whatsappPhone?: string): Promise<LeadData & { extractedEmail?: string; extractedPhone?: string }> {
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const conversationLower = conversationText.toLowerCase();

    const leadData: LeadData = {
      total_messages: messages.filter(m => m.role === 'user').length,
    };

    // Enhanced extraction with multiple patterns

    // Extract name (múltiplos padrões) - CASE INSENSITIVE
    const namePatterns = [
      // Pattern 1: "Meu nome é João Silva Santos", "Me chamo Maria Costa", "Sou o Carlos Eduardo"
      // Captura APENAS após gatilhos específicos, máximo 50 caracteres
      /(?:meu nome (?:é|eh|e)|me chamo|sou (?:o|a)) +([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+(?: +[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+){1,3})(?:\.|,|!|\?|$)/i,
    ];

    // Extract from user messages only (not assistant responses)
    const userMessages = messages.filter(m => m.role === 'user');

    for (const pattern of namePatterns) {
      for (const msg of userMessages) {
        const match = msg.content.match(pattern);
        if (match && match[1]) {
          const possibleName = match[1].trim();

          // Validate it's actually a name
          const words = possibleName.split(/\s+/);
          const triggerWords = ['meu', 'nome', 'chamo', 'sou', 'assistant', 'user', 'qual', 'email', 'telefone', 'perfeito', 'ótimo', 'obrigad'];
          const containsTrigger = triggerWords.some(trigger =>
            possibleName.toLowerCase().includes(trigger)
          );

          // Valid name criteria:
          // - 2 to 4 words (first name + last name(s))
          // - Each word 2-20 characters
          // - No numbers, emails, or trigger words
          // - Total length 4-50 characters
          const isValidName = words.length >= 2 &&
                              words.length <= 4 &&
                              words.every(w => w.length >= 2 && w.length <= 20) &&
                              possibleName.length >= 4 &&
                              possibleName.length <= 50 &&
                              !possibleName.includes('@') &&
                              !/\d/.test(possibleName) &&
                              !containsTrigger;

          if (isValidName) {
            leadData.name = possibleName;
            console.log('✅ Nome extraído (com gatilho):', possibleName);
            break;
          }
        }
      }
      if (leadData.name) break;
    }

    // Pattern 2: Direct name response (when assistant asks for name)
    // Fallback for when user responds directly without trigger words
    if (!leadData.name) {
      for (let i = 0; i < messages.length - 1; i++) {
        const current = messages[i];
        const next = messages[i + 1];

        // Check if assistant asked for name and user responded
        if (
          current.role === 'assistant' &&
          /\b(?:nome|name|chama)\b/i.test(current.content) &&
          next.role === 'user'
        ) {
          const possibleName = next.content.trim();
          const words = possibleName.split(/\s+/);

          // Negative keywords that indicate this is NOT a name
          const negativeKeywords = [
            'meu', 'nome', 'chamo', 'sou', 'assistant', 'user', 'qual', 'email',
            'telefone', 'perfeito', 'ótimo', 'obrigad', 'sim', 'não', 'ok', 'tudo',
            'bem', 'oi', 'olá', 'quero', 'preciso', 'gostaria', '@', 'http', 'www'
          ];

          const containsNegative = negativeKeywords.some(keyword =>
            possibleName.toLowerCase().includes(keyword)
          );

          // Valid direct name response criteria:
          // - 2 to 4 words (first name + last name(s))
          // - Each word 2-20 characters, starts with letter
          // - No numbers, emails, URLs, or negative keywords
          // - Total length 4-50 characters
          const isValidDirectName = words.length >= 2 &&
                                    words.length <= 4 &&
                                    words.every(w => w.length >= 2 && w.length <= 20 && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]/.test(w)) &&
                                    possibleName.length >= 4 &&
                                    possibleName.length <= 50 &&
                                    !possibleName.includes('@') &&
                                    !/\d/.test(possibleName) &&
                                    !containsNegative;

          if (isValidDirectName) {
            leadData.name = possibleName;
            console.log('✅ Nome extraído (resposta direta):', possibleName);
            break;
          }
        }
      }
    }

    if (!leadData.name) {
      console.log('⚠️  Nome não extraído');
    }

    // Extract email (only from user messages, not assistant responses)
    const emailPattern = /\b([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/;
    let extractedEmail: string | undefined;

    // Search in user messages only to avoid capturing example emails from assistant
    for (const msg of userMessages) {
      const emailMatch = msg.content.match(emailPattern);
      if (emailMatch) {
        extractedEmail = emailMatch[1].toLowerCase();
        console.log('✅ Email extraído:', extractedEmail);
        break;
      }
    }

    if (!extractedEmail) {
      console.log('⚠️  Email não encontrado nas mensagens do usuário');
    }

    // Extract phone (padrões brasileiros)
    // PRIORITY: Use WhatsApp phone if available (from session)
    let extractedPhone: string | undefined = whatsappPhone;

    // Fallback: Try to extract from conversation text
    if (!extractedPhone) {
      const phonePatterns = [
        /(?:telefone|celular|whats|número)?\s*(?:\+?55)?\s*\(?(\d{2})\)?\s*(\d{4,5})[-\s]?(\d{4})/i,
        /\b(\d{2})\s*(\d{4,5})[-\s]?(\d{4})\b/,
        /\b(\d{11})\b/, // 11987654321
      ];

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
    }

    if (extractedPhone) {
      console.log('✅ Telefone capturado:', {
        source: whatsappPhone ? 'WhatsApp Session' : 'Conversation Text',
        phone: extractedPhone.substring(0, 5) + '...',
      });
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

    // Send to Mautic if we have complete contact data AND haven't sent yet
    console.log('🔍 Extracted lead data:', {
      name: leadData.name,
      email: extractedEmail,
      phone: extractedPhone ? extractedPhone.substring(0, 5) + '...' : undefined,
      phoneSource: whatsappPhone ? 'WhatsApp Session (auto)' : extractedPhone ? 'Conversation Text' : 'Not captured',
      hasName: !!leadData.name,
      hasEmail: !!extractedEmail,
      hasPhone: !!extractedPhone,
      hasAllData: !!(extractedEmail && extractedPhone && leadData.name),
    });

    if (extractedEmail && extractedPhone && leadData.name) {
      // Check if already sent to Mautic
      const existingLead = await db.getLeadByConversationId(conversationId);
      const alreadySent = existingLead?.mautic_sent_at;

      if (!alreadySent) {
        console.log('✅ All contact data ready, sending to Mautic...', {
          nome: leadData.name,
          email: extractedEmail,
          telefone: extractedPhone ? extractedPhone.substring(0, 5) + '...' : 'N/A',
        });

        try {
          await this.sendToMautic({
            nome: leadData.name,
            email: extractedEmail,
            telefone: extractedPhone,
          });

          // Mark as sent to Mautic
          await db.markLeadSentToMautic(conversationId);
          console.log('✅ Lead successfully sent and marked in Mautic');
        } catch (error: any) {
          // Log detailed error but don't fail the conversation
          console.error('❌ Failed to send to Mautic:', {
            error: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status,
          });
        }
      } else {
        console.log('ℹ️  Lead already sent to Mautic at:', existingLead.mautic_sent_at);
      }
    } else {
      const missingFields = [];
      if (!leadData.name) missingFields.push('nome');
      if (!extractedEmail) missingFields.push('email');
      if (!extractedPhone) missingFields.push('telefone');

      console.log('⚠️  Missing contact data for Mautic:', {
        missingFields: missingFields.join(', '),
        hasName: !!leadData.name,
        hasEmail: !!extractedEmail,
        hasPhone: !!extractedPhone,
      });
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
