import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, LogIn, LogOut, User } from "lucide-react";
import { LoginModal } from "../auth/LoginModal";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../../style/theme";

export const Sidebar: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const { authState, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-[70px] bg-gray-200 dark:bg-zinc-900 border-r dark:border-gray-700 border-gray-300 relative">
      <div className="flex flex-col justify-center items-center h-[10%] text-gray-800 dark:text-gray-200" title="Logo">
        {/* <div className="" title="Logo"> */}
          <MessageSquare size={24} />
          <span className="text-sm  font-bold cursor-pointer transition-all hover:text-indigo-400">
            Talksy
          </span>
          {/* <ThemeToggle /> */}
        {/* </div> */}
      </div>
      <div className="flex justify-between items-center h-[10%] absolute bottom-0">
          <ThemeToggle />
      </div>
    </div>
  );
};
