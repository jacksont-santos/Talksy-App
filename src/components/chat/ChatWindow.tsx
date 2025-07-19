import React, { useEffect, useState, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Room } from '../../types/room';
import { roomService } from '../../services/roomService';

interface ChatWindowProps {
  room: Room;
  nickname: string;
  usersNumber?: number;
  onLeave: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  nickname,
  usersNumber = 0,
  onLeave
}) => {
  
  const { sendMessage } = useWebSocket();
  const { authState } = useAuth();
  const [roomMessages, setRoomMessages] = useState<{ id: string; content: string; sender: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ page, setPage ] = useState(1);
  const [ limit ] = useState(20);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await roomService.getRoomMessages(room._id);
        setRoomMessages(response.data);
      } catch (error) {
        console.error('Error fetching room messages:', error);
      }
    }
    fetchMessages();
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const handleLoadMore = async () => {
    try {
      const response = await roomService.getRoomMessages(room._id, page + 1, limit);
      setRoomMessages(prevMessages => [...prevMessages, ...response.data.messages]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!nickname) return alert('Please set a nickname before sending messages.');
      sendMessage({
        roomId: room._id,
        content,
        nickname,
        userId: authState.user?._id
      });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 dark:bg-zinc-800  border-t border-gray-200 dark:border-zinc-950 px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{room.name}</h2>
          <p className="text-sm text-gray-500">
            {usersNumber} / {room.maxUsers} Participantes
          </p>
        </div>
        <button
          onClick={onLeave}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Deixar Sala
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-200 dark:bg-zinc-900">
        {roomMessages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
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