import React, { useEffect, useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../common/ToasterProvider';
import { useServices } from '../../contexts/ServicesContext';
import { useLoading } from '../../contexts/LoadingContext';

interface AuthModalProps {
  onClose: () => void;
  theme?: 'presentation' | 'default';
}

const themes = {
  default: {
    background: 'bg-gray-100 p-6 shadow-xl dark:bg-zinc-900',
    header: 'text-gray-800 dark:text-gray-100',
    text: 'text-gray-600 dark:text-gray-400',
  },
  presentation: {
    background: 'backdrop-blur-xl bg-white/5 border border-white/10',
    header: 'text-white',
    text: 'text-white',
  }
};

type AuthType = 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({onClose, theme='default'}) => {
  const [type, setType] = useState<AuthType>('signin');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { userService } = useServices();
  const { showToast } = useToastContext();
  const { showLoader } = useLoading();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);

    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) setNickname(storedNickname);
  }, []);

  const clearError = () => {
    if (error) setError('');
  };

  const validateForm = () => {
    const formattedUsername = username.trim();
    const formattedNickname = nickname.trim();


    if (!formattedUsername || !password || (type === 'signup' && !formattedNickname)) {
      setError('Preencha todos os campos.');
      return null;
    }

    if (formattedUsername.length < 6 || formattedUsername.length > 24) {
      setError('O usuário deve ter entre 6 e 24 caracteres.');
      return null;
    }

    if (password.length < 6 || password.length > 16) {
      setError('A senha deve ter entre 6 e 16 caracteres.');
      return null;
    }

    if (type === 'signup' && (formattedNickname.length < 4 || formattedNickname.length > 24)) {
      setError('O apelido deve ter entre 4 e 24 caracteres.');
      return null;
    }

    return {
      usernameInput: formattedUsername,
      passwordInput: password,
      nicknameInput: formattedNickname,
    };
  };

  const authenticate = async (username: string, password: string) => {
    try {
      await login({ username, password });
      const isAuthPage = window.location.pathname === '/';
      if (isAuthPage) {
        showLoader();
        window.navigation.navigate('/home');
      } else {
        onClose();
        showToast('success', 'Autenticado com sucesso.');
      }
    } catch {
      setError('Usuário ou senha incorretos.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const validated = validateForm();
    if (!validated) return;
    const { usernameInput, passwordInput, nicknameInput } = validated;

    setIsLoading(true);

    try {
      if (type === 'signup') {
        await userService.createUserAccount({
          username: usernameInput,
          password: passwordInput,
          nickname: nicknameInput,
        });
        showToast('success', 'Conta criada com sucesso.');
      }

      await authenticate(usernameInput, passwordInput);
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
      <div className={`relative w-full max-w-md rounded-xl p-6 shadow-xl  animate-slide-up ${themes[theme].background}`}>
        <div className="mb-6 text-center">
          <h2 className={`text-2xl font-semibold ${themes[theme].header}`}>
            {type === 'signin' ? 'Login' : 'Criar conta'}
          </h2>
          <p className={`mt-2 text-sm ${themes[theme].text}`}>
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
            labelClassName={themes[theme].header}
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
            labelClassName={themes[theme].header}
            required
          />

          {type === 'signup' && (
            <Input
              label="Apelido"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                clearError();
              }}
              labelClassName={themes[theme].header}
              required
            />
          )}

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
  );
};
