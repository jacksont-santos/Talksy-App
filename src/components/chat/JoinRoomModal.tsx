import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Room } from '../../types/room';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (nickname: string, password?: string) => void;
  room: Room;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoin,
  room 
}) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname) {
      setError('Nickname is required');
      return;
    }
    
    if (!room.public && !password) {
      setError('Password is required for this room');
      return;
    }
    
    onJoin(nickname, password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative animate-slide-up shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join {room.name}</h2>
        <p className="text-gray-600 mb-6">Please enter a nickname to join this room.</p>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Choose a nickname for this chat"
            required
          />
          
          {!room.public && (
            <Input
              label="Room Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Join Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};