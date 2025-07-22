import React, { useEffect, useState, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { useWebSocket, notification } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Room } from '../../types/room';
import { roomService } from '../../services/roomService';
import { ArrowDownIcon } from 'lucide-react';

interface ChatWindowProps {
  room: Room;
  nickname: string;
  token: string;
  usersNumber?: number;
  onLeave: () => void;
}

export interface Message {
  id: string;
  content: string;
  nickname: string;
  createdAt: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  nickname,
  token,
  usersNumber = 0,
  onLeave
}) => {
  
  const { sendMessage, notifications, checkNotification } = useWebSocket();
  const { authState } = useAuth();
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [ iteractivityInited, setIteractivityInited ] = useState(false);
  const [ loadingMoreMessages, setLoadingMoreMessages ] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

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
    };
    fetchMessages();
    container.current?.addEventListener('scroll', () => {
      if (container.current?.scrollTop === 0) {
        setPage(prevPage => prevPage + 1);
      };
    });
  }, []);

  useEffect(() => {
    if (page == 1) return;
    handleLoadMore();
  }, [page]);
  
  useEffect(() => {
    if (roomMessages.length === 0 || iteractivityInited) return;
    setIteractivityInited(true);
    goToBottom();
  }, [roomMessages]);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    };
  }, [notifications]);

  const setNotification = (notification: notification) => {
    const { type, data } = notification;
    if (type !== 'chat') return;
    const { id, roomId, content, nickname, createdAt } = data;
    checkNotification();
    if (roomId !== room._id) return;
    setRoomMessages(prevMessages => [...prevMessages, { id, content, nickname, createdAt }]);
  };

  const handleLoadMore = async () => {
    try {
      if (loadingMoreMessages) return;
      setLoadingMoreMessages(true);

      const previousScrollHeight = container.current?.scrollHeight || 0;;

      const response = await roomService.getRoomMessages(room._id, page, limit);
      if (response.data.length === 0) {
        setLoadingMoreMessages(false);
        return;
      };
      setRoomMessages(prevMessages => [...response.data, ...prevMessages]);
      setTimeout(() => {
        const newScrollHeight = container.current?.scrollHeight || 0;
        const heightDiff = newScrollHeight - previousScrollHeight || 0;
        if (container.current) container.current.scrollTop = heightDiff;
      }, 0);
      setLoadingMoreMessages(false);
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
        token,
        userId: authState.user?._id
      });
  };

  const goToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      <div ref={container} className="flex-grow overflow-y-auto p-4 bg-[#c0f1ba57] dark:bg-[#2f302f57]">
        {roomMessages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          roomMessages.map(message => (
            <MessageItem
              key={message.id}
              currentUserNamer={nickname}
              message={message}
            />
          ))
        )}
        <div ref={messagesEndRef}/>
      </div>
      <button
        onClick={goToBottom}
        className="bg-gray-600 text-white px-3 py-3 fixed bottom-24 right-4 rounded-md hover:bg-indigo-700 transition-colors">
          <ArrowDownIcon size={14} />
        </button>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};