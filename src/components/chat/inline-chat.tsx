import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { ChatBubble } from './chat-bubble';
import { TypingIndicator } from './typing-indicator';

export function InlineChat() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
  } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Consultor de Imigração IA</h3>
          <p className="text-xs text-white/80">Tire suas dúvidas em tempo real</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoadingHistory ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-sm">Carregando histórico...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h4 className="font-semibold text-lg mb-2 text-gray-700">Olá! 👋</h4>
            <p className="text-sm max-w-md mx-auto">
              Sou seu consultor de imigração com IA. Posso ajudar com informações sobre
              vistos, processo de imigração, escolha de cidade e muito mais.
              Como posso ajudar você hoje?
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
            />
          ))
        )}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua pergunta sobre imigração..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder:text-gray-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Resposta em segundos • Disponível 24/7
        </p>
      </div>
    </div>
  );
}
