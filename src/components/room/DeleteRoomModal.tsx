import React from "react";
import { Button } from "../common/Button";

interface DeleteModalProps {
  cancel: () => void;
  confirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  cancel,
  confirm,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-[0.7] flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-lg p-6 w-full max-w-sm relative animate-slide-up shadow-xl">
        <div className="text-sm text-gray-600 mb-6">
          Tem certeza que deseja deletar esta sala? Esta ação não pode ser
          desfeita.
        </div>

        <div className="mt-6 flex justify-between">
          <Button onClick={cancel} variant="secondary" size="sm">
            Cancelar
          </Button>
          <Button onClick={confirm} variant="danger" size="sm">
            Deletar
          </Button>
        </div>
      </div>
    </div>
  );
};
