import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JoinRoomModal } from '../components/chat/JoinRoomModal';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Room } from '../types/room';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { roomService } from '../services/roomService';

// Mock data - In a real app, this would come from an API
const mockRooms: Record<string, Room> = {
  '1': {
    _id: '1',
    name: 'General Chat',
    active: true,
    public: true,
    maxUsers: 50,
    ownerId: 'admin',
  },
  '2': {
    _id: '2',
    name: 'Gaming',
    active: true,
    public: true,
    maxUsers: 20,
    ownerId: 'admin',
  },
  '3': {
    _id: '3',
    name: 'Private Discussion',
    active: true,
    public: false,
    maxUsers: 10,
    ownerId: 'user-1',
  }
};

export const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const { authState } = useAuth();
  // const { joinRoom, leaveRoom } = useWebSocket();
  const navigate = useNavigate();

  const getRoom = async () => {
    const isPrivateRoom = window.location.pathname.includes('/private');
    if (isPrivateRoom && !authState.isAuthenticated)
      navigate('/');
    
    if (roomId) {
      const roomData = await ( isPrivateRoom
        ? roomService.getPrivateRoom(roomId) 
        : roomService.getPublicRoom(roomId)
      )
      .then((response) => response.data)
      .catch(() => navigate('/'));  
        
      if (!roomData.active) navigate('/');
      else {
        setRoom(roomData);
        setIsJoinModalOpen(true);
      };
    };
  };

  useEffect(() => {
    getRoom();
  }, [roomId, navigate]);

  const handleJoinRoom = (nickname: string, password?: string) => {
    // In a real app, this would validate the password with the backend
    
    
    // Join the WebSocket room
    // if (roomId) {
    //   joinRoom(roomId);
    // }
    
    setIsJoinModalOpen(false);
    setHasJoined(true);
  };

  const handleLeaveRoom = () => {
    // if (roomId) {
    //   leaveRoom(roomId);
    // }
    navigate('/');
  };

  if (!room) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      {hasJoined ? (
        <ChatWindow room={room} onLeave={handleLeaveRoom} />
      ) : (
        <div className="h-full flex items-center justify-center">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Join {room.name}
          </button>
        </div>
      )}
      
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          if (!hasJoined) {
            navigate('/');
          }
        }}
        onJoin={handleJoinRoom}
        room={room}
      />
    </div>
  );
};