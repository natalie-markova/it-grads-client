import { Bot, User } from 'lucide-react';
import type { InterviewMessage } from '../../types';

interface ChatMessageProps {
  message: InterviewMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex gap-3 mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-accent-cyan" />
        </div>
      )}
      
      <div
        className={`max-w-[75%] px-4 py-3 rounded-lg ${
          isAI
            ? 'bg-dark-card border border-dark-surface text-gray-200'
            : 'bg-accent-cyan/20 border border-accent-cyan/30 text-white'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>

      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-cyan flex items-center justify-center">
          <User className="w-5 h-5 text-dark-bg" />
        </div>
      )}
    </div>
  );
}