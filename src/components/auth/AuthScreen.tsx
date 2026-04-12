import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { AuthModal } from "./AuthModal";

export function AuthScreen() {
  const { authState } = useAuth();
  const [open, setOpen] = useState(false);

  const start = () => {
    if (authState.isAuthenticated) {
      window.navigation.navigate("home");
      return;
    };
    setOpen(true);
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">      
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center backdrop-blur-xl bg-white/5 border border-white/10 px-10 py-12 rounded-3xl shadow-2xl max-w-[640px]"
      >
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Talksy
        </h1>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed md:line-clamp-2">
          Converse em tempo real com pessoas ao redor do mundo.  
          Crie salas, compartilhe ideias e conecte-se de forma simples, rápida e segura.
        </p>
        <button
          onClick={start}
          className="group relative px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30"
        >
          <span className="relative z-10 font-medium">Começar agora</span>

          <div className="absolute inset-0 rounded-xl bg-indigo-400 blur opacity-0 group-hover:opacity-30 transition" />
        </button>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-20"
          >
            <div className="relative flex items-center justify-center w-full h-full">              
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition z-30"
              >
                ✕
              </button>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-md mx-4 flex justify-center"
              >
                <AuthModal onClose={() => setOpen(false)} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}