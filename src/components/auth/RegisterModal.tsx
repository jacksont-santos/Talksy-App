import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
    const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameFormatted = username.trim();
    if (!usernameFormatted) 
        setError("Usuário é obrigatório.");
    else if (usernameFormatted.length < 6) 
        setError("Usuário deve ter pelo menos 6 caracteres.");
    else {
        localStorage.setItem('nickname', usernameFormatted);
        onClose();
        setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-[0.7] flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-lg p-6 w-full max-w-md relative animate-slide-up shadow-xl">        
        <div className="text-sm text-gray-600 mb-6">
            Por favor, informe um nome de usuário para continuar. Este nome será usado para identificar você nas salas de bate-papo.
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-center rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="primary">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};