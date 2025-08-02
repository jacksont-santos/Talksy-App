import React, { useState } from "react";
import { LoginModal } from "../auth/LoginModal";
import { useAuth } from "../../contexts/AuthContext";
import { roomService } from "../../services/roomService";
import ThemeToggle from "../../style/theme";
import { FormRoom } from "../../types/room";
import { CreateRoomModal } from "./CreateRoomModal";
import {
  MessagesSquare,
  MessageSquareDot,
  LogIn,
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  setSession: (session: "public" | "private") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ setSession }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { authState, logout } = useAuth();

  const handleAuthClick = () => {
    if (authState.isAuthenticated) {
      logout();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const saveRoom = (roomData: FormRoom) => {
    if (!authState.isAuthenticated) return;
    roomService.createRoom(roomData);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="w-[70px] bg-gray-300 dark:bg-zinc-900 border-r dark:border-gray-700 border-gray-300 relative">
      <div
        className="flex flex-col justify-center items-center h-[10%] text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700"
      >
        {expanded ? (
          <ChevronLeft size={20} onClick={() => setExpanded(false)} />
        ) : (
          <ChevronRight size={20} onClick={() => setExpanded(true)} />
        )}
      </div>
      <div
        onClick={handleAuthClick}
        className="flex flex-col justify-center items-center h-[10%] text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700"
      >
        {authState.isAuthenticated ? (
          <>
            <LogOut size={20} />
            <span className="text-xs font-bold">Sair</span>
          </>
        ) : (
          <>
            <LogIn size={20} />
            <span className="text-xs  font-bold">Entrar</span>
          </>
        )}
      </div>
      <div
        className="
          flex flex-col justify-center items-center h-[10%] 
          text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700
        "
        onClick={() => setSession("public")}
      >
        <MessagesSquare size={20} />
        <span className="text-xs  font-bold">Publico</span>
      </div>
      <div
        className="
          flex flex-col justify-center items-center h-[10%] 
          text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700
        "
        onClick={() => setSession("private")}
      >
        <MessageSquareDot size={20} />
        <span className="text-xs text-center font-bold">Minhas salas</span>
      </div>
      {authState.isAuthenticated && (
        <div
          className="
            flex flex-col justify-center items-center h-[10%] 
            text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700
          "
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircle size={20} />
          <span className="text-xs  font-bold">Nova sala</span>
        </div>
      )}
      <div className="flex justify-center items-center w-full h-[10%] absolute bottom-0">
        <ThemeToggle />
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      {isCreateModalOpen && (
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={saveRoom}
        />
      )}
    </div>
  );
};
