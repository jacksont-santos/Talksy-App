import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const usernameFormatted = username.trim();
    if (!usernameFormatted || !password) {
      setError('Preencha o usuário e a senha');
      return;
    }
    
    login({ username: usernameFormatted, password })
      .then(() => onClose())
      .catch(() => setError("Usuário ou senha incorretos."));
  };

  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-[0.7] flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-lg p-6 w-full max-w-sm relative animate-slide-up shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-semibold text-center">Login</h2>

        <span className="text-sm text-gray-600 dark:text-gray-200">
            Autentique-se para criar, editar, excluir e obter acesso às suas salas de bate-papo.
        </span>
        
        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 text-center rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className='mt-6'>
          <Input
            label="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="mt-6 flex justify-between">
            <Button 
              type="button" 
              size='sm'
              variant="secondary" 
              onClick={onClose}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size='sm'
              variant="primary"
            >
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};