import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, LogIn, LogOut, User } from 'lucide-react';
import { LoginModal } from '../auth/LoginModal';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../style/theme';

export const Navbar: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-indigo-700 dark:bg-zinc-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <MessageSquare size={24} className="mr-2" />
            <span 
              className="text-xl font-bold cursor-pointer transition-all hover:text-indigo-200"
              onClick={() => navigate('/')}
            >
              Talksy
            </span>
            <ThemeToggle />
          </div>
          
          <div>
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>{authState.user?.username}</span>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center px-3 py-1 bg-indigo-800 rounded hover:bg-indigo-900 transition-colors"
                >
                  <LogOut size={18} className="mr-1" />
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center px-3 py-1 bg-indigo-800 rounded hover:bg-indigo-900 transition-colors"
              >
                <LogIn size={18} className="mr-1" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
};