import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { ChatBubble } from './chat-bubble';
import { TypingIndicator } from './typing-indicator';
import { cn } from '@/lib/utils';
import { trackPixelEvent, FacebookPixelEvents } from '@/lib/facebook-pixel';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const [hasTrackedFirstMessage, setHasTrackedFirstMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    sessionId,
    unreadCount,
  } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Track chat open
    if (isOpen && !hasTrackedOpen) {
      trackPixelEvent(FacebookPixelEvents.LEAD, {
        content_name: 'Chat Widget Opened',
        source: 'web_chat',
      });
      setHasTrackedOpen(true);
    }
  }, [isOpen, hasTrackedOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');

    // Track first message
    if (!hasTrackedFirstMessage && messages.length === 0) {
      trackPixelEvent(FacebookPixelEvents.LEAD, {
        content_name: 'Chat Engagement',
        source: 'web_chat',
      });
      setHasTrackedFirstMessage(true);
    }

    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2"
        aria-label="Abrir chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl transition-all",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px] max-h-[80vh]",
        "flex flex-col overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Viva Academy</h3>
            <p className="text-xs text-white/80">Sempre online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-sm">Olá! Como posso ajudar você com sua imigração para os EUA?</p>
              </div>
            )}
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Geralmente responde em segundos
            </p>
          </div>
        </>
      )}
    </div>
  );
}
