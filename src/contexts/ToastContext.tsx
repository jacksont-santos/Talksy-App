// // src/components/ToastProvider.tsx
// import { createContext, useContext, useState, useCallback } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { X } from "lucide-react";

// type Toast = {
//   id: number;
//   message: string;
// };

// type ToastContextType = {
//   showToast: (message: string) => void;
// };

// const ToastContext = createContext<ToastContextType | undefined>(undefined);

// export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   const showToast = useCallback((message: string) => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, message }]);
//     setTimeout(() => {
//       setToasts((prev) => prev.filter((toast) => toast.id !== id));
//     }, 3000);
//   }, []);

//   return (
//     <ToastContext.Provider value={{ showToast }}>
//       {children}

//       <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
//         <AnimatePresence>
//           {toasts.map((toast) => (
//             <motion.div
//               key={toast.id}
//               initial={{ opacity: 0, x: 50 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 50 }}
//               className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[250px]"
//             >
//               <span>{toast.message}</span>
//               <button
//                 onClick={() =>
//                   setToasts((prev) => prev.filter((t) => t.id !== toast.id))
//                 }
//               >
//                 <X className="w-4 h-4 ml-4" />
//               </button>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//     </ToastContext.Provider>
//   );
// };

// export const useToastContext = () => {
//   const context = useContext(ToastContext);
//   if (!context) {
//     throw new Error("useToastContext must be used within a ToastProvider");
//   }
//   return context;
// };
