import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (password?: string) => void;
  roomName: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  roomName,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("Sala protegida por senha");
      return;
    }

    onJoin(password);
  };

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

        <h3 className="text-xl font-semibold mb-6 text-center">{roomName}</h3>

        <span className="text-sm text-gray-600 dark:text-gray-200 text-center block w-full">
          Digite a senha para entrar na sala.
        </span>

        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="mt-6 flex justify-between items-center">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onClose}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
