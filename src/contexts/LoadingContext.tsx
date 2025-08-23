import { createContext, useContext, useState, ReactNode } from 'react';
import Loading from './../components/layout/Loading';
import { timer } from '../utils/timer';

type LoadingContextType = {
  isLoading: boolean;
  setMessage: (message: string) => void;
  showLoader: () => void;
  hideLoader: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setNewMessage] = useState<string>();

  const showLoader = () => {
    setNewMessage(undefined);
    setIsLoading(true)
  };
  const hideLoader = async () => {
    await timer(400);
    setIsLoading(false);
  };

  const setMessage = async (message: string) => {
    await timer(400);
    setNewMessage(message);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setMessage, showLoader, hideLoader }}>
      {(isLoading || message) && <Loading message={message} />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
