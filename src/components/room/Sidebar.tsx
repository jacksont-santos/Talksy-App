import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthModal } from "../auth/AuthModal";
import { useAuth } from "../../contexts/AuthContext";
import { roomService } from "../../services/roomService";
import ThemeToggle from "../../style/theme";
import { FormRoom } from "../../types/room";
import { CreateRoomModal } from "./CreateRoomModal";
import {
  MessagesSquare,
  MessageSquareDot,
  MessageSquareText,
  LogIn,
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  UserRoundPlus,
} from "lucide-react";

interface SidebarProps {
  setSession: (session: "public" | "private" | "participant") => void;
  setDisplayRoomList: (display: boolean) => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ setSession, setDisplayRoomList, isMobile }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<'signin' | 'signup'>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const { authState, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [isParticipant, setParticipant] = useState(false);

  useEffect(() => {
    const participant = localStorage.getItem("participant");
    const invited = searchParams.get("room");
    if (participant || invited) setParticipant(true);
  }, []);

  const expandList = (state: boolean) => {
    setExpanded(state);
    setDisplayRoomList(state);
  };

  const handleSignupClick = () => {
    setIsAuthModalOpen("signup");
  };

  const handleSigninClick = () => {
    if (authState.isAuthenticated) {
      logout();
    } else {
      setIsAuthModalOpen("signin")
    }
  };

  const saveRoom = (roomData: FormRoom) => {
    if (!authState.isAuthenticated) return;
    roomService.createRoom(roomData);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="w-[70px] min-w-[70px] bg-gray-300 dark:bg-zinc-900 border-r dark:border-gray-700 border-gray-300 relative">
      <div
        className="flex flex-col justify-center items-center h-[10%] text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700"
      >
        { !isMobile && (
          <div>
            {expanded ? (
              <ChevronLeft size={20} onClick={() => expandList(false)} />
            ) : (
              <ChevronRight size={20} onClick={() => expandList(true)} />
            )}
          </div>
        )}
      </div>
      <div
        onClick={handleSignupClick}
        className="flex flex-col justify-center items-center h-[10%] text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700"
      >
        <>
          <UserRoundPlus size={20} />
          <span className="text-xs font-bold">Criar conta</span>
        </>
      </div>
      <div
        onClick={handleSigninClick}
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
      {isParticipant && (
        <div
          className="
            flex flex-col justify-center items-center h-[10%] 
            text-gray-800 dark:text-gray-200 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-700
          "
          onClick={() => setSession("participant")}
        >
          <MessageSquareText size={20} />
          <span className="text-xs  font-bold">Participante</span>
        </div>
      )}
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

      <AuthModal
        type={isAuthModalOpen}
        isOpen={!!isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(undefined)}
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
