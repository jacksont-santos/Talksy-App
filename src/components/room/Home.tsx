import React, { useEffect, useState } from "react";
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

export const HomePage: React.FC = () => {
  const { signoutRoom, notifications, checkNotification } = useWebSocket();

  const [openModal, setOpenModal] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  const [room, setRoom] = useState<Room | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
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

  return (
    <div className="size-full">
      <div className="flex size-full flex ">
        <Sidebar />
        <div className="flex-grow">
          <Navbar />
          <div className="flex overflow-hidden h-[90%]">
            <RoomList onSelect={setRoom} setLoading={setLoading} />
            <div className="flex-grow">
              {room && (
                <ChatRoomPage
                  nickname={nickname}
                  room={room}
                  onLeave={onLeave}
                  loading={loading}
                />
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
