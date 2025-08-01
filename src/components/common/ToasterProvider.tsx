import { createContext, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";

type Toast = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
};

type ToastContextType = {
  showToast: (
    type: 'info' | 'success' | 'error' | 'warning',
    message: string
  ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [display, setDisplay] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  const toast = toasts[0];

  const generateId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  };

  const timer = (time: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const showToast = (
    type: 'info' | 'success' | 'error' | 'warning',
    message: string,
  ) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = async (id: string) => {
    setAnimationStarted(true);
    await timer(300);
    setDisplay(false);
    setAnimationStarted(false);
    await timer(600);
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (toast && !display) {
      setDisplay(true);
      const timeout = setTimeout(() => {
        removeToast(toast.id);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  const type = {
    info: "bg-blue-500 text-white",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-[140px] right-[40px] z-50 flex flex-col gap-2">
        {toast && display && (
          <div
            className={`${type[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[250px] ${animationStarted ? "duration-300 ease-out opacity-0 translate-y-4" : "opacity-1"} transition-all`}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>
              <X className="w-4 h-4 ml-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
