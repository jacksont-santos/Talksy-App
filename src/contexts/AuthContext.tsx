import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useServices } from './ServicesContext';
import { AuthState } from '../types/user';
import { userAuth } from '../services/userService';
import { useLoading } from './LoadingContext';
import { AuthModal } from "../../src/components/auth/AuthModal";
import { ModalHandler } from '../components/common/ModalHandler';
import { timer } from '../utils/timer';

interface AuthContextType {
  authState: AuthState;
  login: (authData: Omit<userAuth, 'nickname'>) => Promise<void>;
  logout: () => void;
  setAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const { userService, httpService } = useServices();
  const loadingService = useLoading();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    init();
    verifyAutentication();
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
        .catch(async () => {
          localStorage.removeItem('authToken');
          resetAuthState(true);
          await timer(400);
          setAuthModalOpen(true);
          loadingService.finishLoader();
        });
    }
    else {
      setAuthModalOpen(true);
      await timer(400);
      loadingService.finishLoader();
    };
  }

  const verifyAutentication = () => {
    httpService.getHttp().interceptors.response.use(
      (response) => response,
      (error) => {
        console.log(error);
        if (error.response.status === 401) setAuthModalOpen(true);
        return Promise.reject(error);
      });
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

  const isAuthPage = window.location.pathname === '/';
  const showAuthModal = !isAuthPage && authModalOpen;

  return (
    <AuthContext.Provider value={{ authState, login, logout, setAuthModalOpen}}>
      {children}
      <ModalHandler isOpen={showAuthModal}>
      <AuthModal onClose={() => setAuthModalOpen(false)}/>
      </ModalHandler>
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