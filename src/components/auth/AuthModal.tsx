import React, { useEffect, useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { useToastContext } from '../common/ToasterProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthType = 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<AuthType>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToastContext();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  if (!isOpen) return null;

  const clearError = () => {
    if (error) setError('');
  };

  const validateForm = () => {
    const formattedUsername = username.trim();

    if (!formattedUsername || !password) {
      setError('Preencha o usuário e a senha.');
      return null;
    }

    if (formattedUsername.length < 4 || formattedUsername.length > 20) {
      setError('O usuário deve ter entre 4 e 20 caracteres.');
      return null;
    }

    if (password.length < 6 || password.length > 16) {
      setError('A senha deve ter entre 6 e 16 caracteres.');
      return null;
    }

    return formattedUsername;
  };

  const authenticate = async (formattedUsername: string) => {
    try {
      await login({ username: formattedUsername, password });
      showToast('success', 'Autenticado com sucesso.');
      onClose();
    } catch {
      setError('Usuário ou senha incorretos.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const formattedUsername = validateForm();
    if (!formattedUsername) return;

    setIsLoading(true);

    try {
      if (type === 'signup') {
        await userService.createUserAccount({
          username: formattedUsername,
          password,
        });
        showToast('success', 'Conta criada com sucesso.');
      }

      await authenticate(formattedUsername);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError('Usuário já existe.');
      } else {
        setError(
          type === 'signup'
            ? 'Falha ao criar conta.'
            : 'Falha ao autenticar.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-xl bg-gray-100 p-6 shadow-xl dark:bg-zinc-900 animate-slide-up">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {type === 'signin' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Acesse e gerencie suas salas de bate-papo.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 animate-fade-in">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuário"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError();
            }}
            required
            
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            required
          />

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              onClick={() => {
                setType(type === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
            >
              {type === 'signin'
                ? 'Não tem conta? Criar agora'
                : 'Já tem conta? Entrar'}
            </button>

            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading
                ? 'Processando...'
                : type === 'signin'
                ? 'Entrar'
                : 'Criar conta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
