import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Room } from '../../types/room';

interface ChatWindowProps {
  room: Room;
  onLeave: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ room, onLeave }) => {
  const { messages, sendMessage } = useWebSocket();
  const { authState } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const roomMessages = messages[room._id] || [];
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleSendMessage = (content: string) => {
    if (authState.user && authState.user.username) {
      sendMessage(
        room._id,
        content,
        authState.user.username,
        authState.user._id
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{room.name}</h2>
          <p className="text-sm text-gray-500">
            {room.userCount || 0} / {room.maxUsers} users
          </p>
        </div>
        <button
          onClick={onLeave}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Leave Room
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {roomMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          roomMessages.map(message => (
            <MessageItem key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};