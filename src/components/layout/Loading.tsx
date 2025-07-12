import React from "react";
import { Button } from "../common/Button";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = (props) => {
  console.log(props.message)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        {props.message ? (
          <>
            <p className="mt-4 text-blue-600 dark:text-gray-500 text-lg font-medium">
              {props.message}
            </p>
            <Button
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-blue-600 dark:text-gray-500 text-lg font-medium">
              Carregando...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Loading;
