import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FormRoom, Room } from '../../types/room';
import { useAuth } from '../../contexts/AuthContext';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: FormRoom) => void;
  room?: Room | null;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  room 
}) => {
  const [name, setName] = useState('');
  const [active, setIsActive] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [maxUsers, setMaxUsers] = useState(5);
  // const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { authState } = useAuth();

  const MAX_USERS_LIMIT = 10;

  useEffect(() => {
    if (room) {
      setName(room.name);
      setIsActive(room.active);
      setIsPublic(room.public);
      setMaxUsers(room.maxUsers);
      // setHasPassword(room.hasPassword);
      // Password is not loaded from existing room for security reasons
    }
  }, [room]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('Room name is required');
      return;
    }
    
    if (!isPublic && !password && !room) {
      setError('Password is required for private rooms');
      return;
    }
    
    const newRoom: FormRoom = {
      name,
      active,
      isPublic,
      maxUsers,
      password,
    };
    
    onSave(newRoom);
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
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {room ? 'Edit Room' : 'Create New Room'}
        </h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Room Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Public</span>
            </label>
          </div>
          
          <Input
            label="Maximum Users"
            type="number"
            value={maxUsers.toString()}
            onChange={(e) => setMaxUsers(parseInt(e.target.value) || 0)}
            required
          />
          
          {!isPublic && (
            <Input
              label={room ? 'New Password (leave empty to keep current)' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={true}
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
              {room ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};