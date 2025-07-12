import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Room } from '../../types/room';
import { Button } from '../common/Button';

interface RoomCardProps {
  room: Room;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onEdit, 
  onDelete,
  isOwner
}) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate(`/${room.public ? 'public' : 'private'}/${room._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-indigo-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
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
        <span> 0/{room.maxUsers}</span>
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