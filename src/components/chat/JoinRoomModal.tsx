import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Room } from '../../types/room';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (password?: string) => void;
  roomName: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoin,
  roomName,
  // room 
}) => {
  // const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // if (!nickname) {
    //   setError('Nickname is required');
    //   return;
    // }
    
    if (!password) {
      setError('Sala protegida por senha');
      return;
    }
    
    onJoin(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-[0.7] flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-lg p-6 w-full max-w-md relative animate-slide-up shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{roomName}</h3>
        {/* <p className="text-gray-600 mb-6">Please enter a nickname to join this room.</p> */}
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* <Input
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Choose a nickname for this chat"
            required
          /> */}
          
          
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};