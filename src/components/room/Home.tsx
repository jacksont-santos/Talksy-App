import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../layout/Navbar";
import { Sidebar } from "./Sidebar";
import { roomService } from "../../services/roomService";
import { Room, FormRoom } from "../../types/room";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { CreateRoomModal } from "./CreateRoomModal";
import { RegisterModal } from "../auth/RegisterModal";
import { StoredRoom } from "../../types/room";
import { ChatRoomPage } from "./ChatRoom";
import { RoomList } from "./RoomList";
import { MessageType } from "../../contexts/WebSocketContext";
import { MessageCircleMore } from "lucide-react";

export const HomePage: React.FC = () => {
  const { signoutRoom, notifications, checkNotification } = useWebSocket();
  const [searchParams] = useSearchParams();

  const [openModal, setOpenModal] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sessionSelected, setSessionSelected] = useState(true);
  const [session, setSession] = useState<"public" | "private" | "participant">("public");

  const [displayRoomList, setDisplayRoomList] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    document.title = room ? room.name : "Talksy App";
    if (!room) setSessionSelected(true);
  }, [room])

  useEffect(() => {
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 768;
      setIsMobile(isMobile);
    });

    if (searchParams.has("room")) setSession("participant");
    else {
      const storedSession = (localStorage.getItem("session")) as "public" | "private" | "participant";
      if (storedSession) setSession(storedSession);
    };
    
    const nickname = localStorage.getItem("nickname");
    if (nickname) setNickname(nickname);
    else setOpenModal(true);
  }, []);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    }
  }, [notifications]);

  const setNotification = (notification: notification) => {
    checkNotification(notification.id);
    const { type, data } = notification;

    switch (type) {
      case MessageType.SIGNOUT_REPLY:
        const { _id: roomId } = data;
        if (roomId == room?._id) setRoom(null);

        const storedRooms = localStorage.getItem("rooms");
        if (storedRooms) {
          let rooms: StoredRoom[] = JSON.parse(storedRooms);
          const room = rooms.find((item) => item.id === roomId);
          if (room) {
            rooms = rooms.filter((item) => item.id !== roomId);
            localStorage.setItem("rooms", JSON.stringify(rooms));
          }
        }
        break;
    }
  };

  const onSelect = (value?: Room) => {
    if (value) setRoom(value);
    setSessionSelected(false);
  };

  const onLeave = (roomId: string) => {
    signoutRoom({ roomId, nickname });
  };

  const saveRoom = (roomData: FormRoom) => {
    if (editingRoom) roomService.updateRoom(editingRoom._id, roomData);
    else roomService.createRoom(roomData);

    setIsCreateModalOpen(false);
    setEditingRoom(null);
  };

  const onCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) setNickname(savedNickname);
  };

  const handleSession = (session: "public" | "private" | "participant") => {
    setSessionSelected(true);
    setSession(session);
    localStorage.setItem("session", session);
  };

  return (
    <div className="size-full">
      <div className="flex size-full flex ">
        <Sidebar
          setSession={handleSession}
          setDisplayRoomList={setDisplayRoomList}
        />
        <div className="flex-grow">
          <Navbar nickname={nickname} />
          <div className="flex overflow-hidden h-[90%]">
            <div className={!isMobile ? "w-fit" : sessionSelected ? "w-full" : "w-[0px]"}>
              <RoomList
                display={isMobile ? true : displayRoomList}
                session={session}
                isMobile={isMobile}
                roomIdJoined={room?._id}
                onSelect={onSelect}
                setLoading={setLoading}
              />
            </div>
            <div className={!isMobile ? "flex-grow" : sessionSelected ? "w-[0px]" : "w-full"}>
              {room && (
                <ChatRoomPage
                  nickname={nickname}
                  room={room}
                  onLeave={onLeave}
                  hide={sessionSelected && isMobile}
                  loading={loading}
                />
              )}
              {!room && !isMobile && (
                <div
                  className="text-gray-400 h-full flex flex-col justify-center items-center text-gray-700 dark:text-gray-400 text-sm font-medium"
                >
                  <MessageCircleMore size={60} className="text-gray-400"/>
                  <span className="mt-4 mb-2 font-bold text-base text-center text-indigo-600 dark:text-indigo-700">
                    Talksy App
                  </span>
                  Crie de salas de bate-papo publicas ou privadas, envie e receba mensagens rápido e facil.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isCreateModalOpen && (
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingRoom(null);
          }}
          onSave={saveRoom}
          room={editingRoom}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => onCloseRegisterModal()}
        />
      )}
      <RegisterModal isOpen={openModal} onClose={() => location.reload()} />
    </div>
  );
};
