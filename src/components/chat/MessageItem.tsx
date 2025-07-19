import React from 'react';
// import { Message } from '../../types/message';
import { useAuth } from '../../contexts/AuthContext';

interface MessageItemProps {
  message: any;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { authState } = useAuth();
  const isCurrentUser = authState.user?._id === message.sender.id;
  const isSystem = message.sender.id === 'system';
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isSystem) {
    return (
      <div className="my-4 text-center">
        <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 text-gray-600 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`rounded-lg px-4 py-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg break-words 
        shadow-sm
        animate-fade-in-fast
        ${
          isCurrentUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="font-semibold text-sm mb-1">{message.sender.nickname}</div>
        )}
        <div>{message.content}</div>
        <div className={`text-xs ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'} text-right mt-1`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};