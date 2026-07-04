import React, { ReactNode } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  children: ReactNode;
}

export const ModalHandler: React.FC<AuthModalProps> = ({ isOpen, children}) => {
    if (!isOpen) return null;

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
      {children}
    </div>
  );
}