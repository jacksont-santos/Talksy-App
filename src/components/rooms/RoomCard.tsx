import React from 'react';
import { Lock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Room } from '../../types/room';
import { Button } from '../common/Button';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface RoomCardProps {
  room: Room;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
  usersNumber?: number;
  nickname?: string;
  userId?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onEdit, 
  onDelete,
  isOwner,
  usersNumber = 0,
  nickname = '',
  userId,
}) => {
  const { connected, signRoom } = useWebSocket();

  const handleJoin = () => {
    if (!connected) {
      alert('Conexão com o servidor não estabelecida. Tente novamente mais tarde.');
      return;
    };
    signRoom({
      type: 'signinRoom',
      roomId: room._id,
      nickname: nickname,
      isPublic: room.public,
      userId: userId,
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-950 hover:border-indigo-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{room.name}</h3>
        <div className="flex items-center space-x-2">
          {!room.public && (
            <span title='Sala privada'><Lock size={16} className="text-gray-500" /></span>
          )}
          {room.active ? (
            <CheckCircle size={16} className="text-emerald-500" />
          ) : (
            <XCircle size={16} className="text-red-500" />
          )}
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Users size={16} className="mr-1" />
        <span> {usersNumber}/{room.maxUsers}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          onClick={handleJoin} 
          disabled={!room.active}
          variant={room.active ? 'primary' : 'secondary'}
          size="sm"
          className="transition-transform hover:scale-105"
        >
          Participar
        </Button>
        
        {isOwner && (
          <div className="flex space-x-2">
            <Button onClick={onEdit} variant="secondary" size="sm">
              Editar
            </Button>
            <Button onClick={onDelete} variant="danger" size="sm">
              Deletar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};