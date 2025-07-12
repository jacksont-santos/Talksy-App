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
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken)
      userService.getUser()
        .then((response) => {
          const user = response.data;
          if (user)
            setAuthState({
              user,
              isAuthenticated: true,
            });
        })
        .catch(() => {
          setAuthState({
            user: null,
            isAuthenticated: false,
          });
          localStorage.removeItem('authToken');
        });
  }, []);

  const login = async (authData: userAuth) => {
    return userService.signin(authData)
    .then((response) => {
      const user = response.data;
      if (user) localStorage.setItem('authToken', user.token);
      setAuthState({
        user: { _id: user._id, username: user.username },
        isAuthenticated: true,
      });
    });
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
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