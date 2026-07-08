import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { AuthModal } from "./AuthModal";
import { Presentation } from "./Presentation";

export function AuthScreen() {
  const [open, setOpen] = useState(false);
  const [isHorizontal] = useState(
    window.innerWidth >= window.innerHeight || window.innerWidth >= 1024
  );
  const { authState } = useAuth();

  const start = () => {
    if (authState.isAuthenticated) {
      window.navigation.navigate("home");
      return;
    };
    setOpen(true);
  };

  const displayPresentation = isHorizontal || !open;

  return (
    <div className="relative h-screen w-screen flex flex-col lg:flex-row items-center justify-center lg:items-center lg:justify-evenly bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />
      {displayPresentation && (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col relative z-10 text-center backdrop-blur-xl bg-white/5 border border-white/10 px-5 sm:px-10 sm:py-5 rounded-3xl shadow-2xl max-w-[640px] w-full max-h-[90vh] h-[90vh] min-h-[90vh] overflow-hidden"
      >
        <h1 className="text-2xl font-extrabold mb-4 tracking-tight">Talksy</h1>
        <Presentation onStart={start} />
      </motion.div>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-md mx-4 flex justify-center"
          >
            <AuthModal onClose={() => setOpen(false)} theme="presentation" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}