import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  tokensUsed: number;
  finishReason: string | null | undefined;
}

export class OpenAIClient {
  async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const {
      messages,
      temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens = 2000
    } = options;

    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: messages as ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        tokensUsed: response.usage?.total_tokens || 0,
        finishReason: response.choices[0]?.finish_reason,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async createStreamingCompletion(options: ChatCompletionOptions) {
    const {
      messages,
      temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens = 2000
    } = options;

    try {
      const stream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: messages as ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      return stream;
    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      throw new Error('Failed to create streaming response');
    }
  }
}

export const openaiClient = new OpenAIClient();
