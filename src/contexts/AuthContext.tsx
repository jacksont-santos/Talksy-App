import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types/user';
import { userAuth, userService } from '../services/userService';

interface AuthContextType {
  authState: AuthState;
  login: (authData: userAuth) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      await userService.getUser()
        .then((response) => {
          const user = response.data;
          if (user)
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
        })
        .catch(() => {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          localStorage.removeItem('authToken');
        });
    }
    else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };
  }

  const login = async (authData: userAuth) => {
    return userService.signin(authData)
    .then((response) => {
      const user = response.data;
      if (user) {
        localStorage.setItem('authToken', user.token);
        localStorage.setItem('username', user.username);
      }
      setAuthState({
        user: { _id: user._id, username: user.username },
        isAuthenticated: true,
        isLoading: false,
      });
    })
    .catch(() => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    });
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
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