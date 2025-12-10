import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-900'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span className={cn('text-xs mt-1 block opacity-70')}>
          {message.createdAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
