import React, { useState, useEffect } from "react";
import { ChatWindow } from "../chat/ChatWindow";
import { Room } from "../../types/room";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { useToastContext } from "../common/ToasterProvider";
import { MessageType } from "../../contexts/WebSocketContext";

interface ChatRoomProps {
  onLeave: (roomId: string) => void;
  room: Room;
  nickname: string;
  hide?: boolean;
  loading?: boolean;
}

export const ChatRoomPage: React.FC<ChatRoomProps> = ({
  onLeave,
  room,
  nickname,
  hide = false,
  loading = false,
}) => {
  const { authState } = useAuth();
  const { showToast } = useToastContext();
  const [ roomState, setRoomState ] = useState(0);
  const [ currentRoomId, setCurrentRoomId ] = useState<string | null>(null);

  const {
    wsToken,
    checkNotification,
    notifications,
  } = useWebSocket();

  const messagesToReceive = [
    MessageType.ROOM_STATE,
    MessageType.SIGNIN_ROOM,
    MessageType.SIGNOUT_ROOM,
  ];

    if (!room.active) return null;

  useEffect(() => {
    if (authState.isLoading) return;
    if (!currentRoomId) {
      setCurrentRoomId(room._id);
    }
    else if (currentRoomId !== room._id) {
      setRoomState(0);
      onLeave(currentRoomId);
      setCurrentRoomId(room._id);
    }
    else {
        showToast("success", "Sala atualizada com sucesso.");
    };
  }, [authState.isLoading, room]);

  useEffect(() => {
      if (notifications.length) {
        setNotification(notifications[0]);
      };
    }, [notifications]);

  const setNotification = (notification: notification) => {
    const { type, data } = notification;

    if (!messagesToReceive.includes(type)) return;
    checkNotification(notification.id);

    const { _id: roomId, nickname, users } = data;

    switch (type) {
      case MessageType.ROOM_STATE:
        if (roomId == room?._id) setRoomState(users);
        break;
      case MessageType.SIGNIN_ROOM:
        setRoomState(users);
        showToast("info", `${nickname} entrou na sala.`);
        break;
      case MessageType.SIGNOUT_ROOM:
        showToast("info", `${nickname} deixou a sala.`);
        setRoomState(users);
        break;
    };
  };

  return (
    <div className={`${hide ? "hidden" : ""} h-full bg-gray-100 dark:bg-[#161616]`}>
      {nickname && room && wsToken && !loading && (
        <ChatWindow
          room={room}
          nickname={nickname}
          token={wsToken}
          usersNumber={roomState}
          onLeave={onLeave}
        />
      )}
      {loading && (
        <div className="h-full flex flex-col justify-center items-center text-gray-700 dark:text-gray-400 text-lg font-medium">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      )}
    </div>
  );
};