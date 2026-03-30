import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types/user';
import { userAuth, userService } from '../services/userService';
import { AuthModal } from "../../src/components/auth/AuthModal";

interface AuthContextType {
  authState: AuthState;
  login: (authData: Omit<userAuth, 'nickname'>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      await userService.getUser()
        .then((response) => {
          const user = response.data;
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            token: authToken,
          });
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          resetAuthState(true);
          setAuthModalOpen(true);
        });
    }
    else {
      setAuthModalOpen(true);
    };
  }

  const login = async (authData: Omit<userAuth, 'nickname'>) => {
    return userService.signin(authData)
    .then((response) => {
      const user = response.data;
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('nickname', user.nickname);
      setAuthState({
        user: { _id: user._id, username: user.username, nickname: user.nickname },
        isAuthenticated: true,
        isLoading: false,
        token: user.token,
      });
    })
    .catch((error) => {
      resetAuthState();
      throw error;
    });
  };

  const logout = () => {
    resetAuthState();
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('nickname');
  };

   const resetAuthState = (keepLoading = false) => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: keepLoading,
      token: null,
    });
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};