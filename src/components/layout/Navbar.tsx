import React from "react";
import { MessageSquare, User } from "lucide-react";

export const Navbar: React.FC<{ nickname: string }> = ({ nickname }) => {
  return (
    <nav
      className="
      bg-gray-200 dark:bg-zinc-900 shadow-md 
      flex justify-between items-center h-[10%] px-6
    "
    >
      <div
        className="
        flex justify-center items-center h-[10%] 
        text-gray-800 dark:text-gray-200
        "
        title="Logo"
      >
        <MessageSquare size={20} />
        <span className="text-xs font-bold ml-2">Talksy</span>
      </div>
      <div>
        <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
          <span className="rounded-full bg-gray-300 dark:bg-zinc-800 px-3 py-3 text-sm flex items-center">
            <User size={18} className="" />
          </span>
          <span>{nickname}</span>
        </div>
      </div>
    </nav>
  );
};
