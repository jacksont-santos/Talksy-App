import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatWindow } from "../components/chat/ChatWindow";
import { Room } from "../types/room";
import { useAuth } from "../contexts/AuthContext";
import { roomService } from "../services/roomService";
import { RegisterModal } from "../components/auth/RegisterModal";
import { useLoading } from "../contexts/LoadingContext";
import { useWebSocket, notification } from "../contexts/WebSocketContext";
import { useToastContext } from "../components/common/ToasterProvider";

export const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { authState } = useAuth();
  const loadingService = useLoading();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const [ room, setRoom ] = useState<Room | null>(null);
  const [ roomState, setRoomState ] = useState(0);
  const [ nickname, setNickname ] = useState<string>();

  const [ openModal, setOpenModal ] = useState(false);
  const [ hasJoined, setHasJoined ] = useState(false);

  const {
    signRoom,
    getRoomState,
    setWsToken,
    wsToken,
    checkNotification,
    notifications,
  } = useWebSocket();

  useEffect(() => {
    loadingService.showLoader();
    joinRoom();
  }, []);

    const joinRoom = async () => {
    if (!roomId) return navigate("/");
    const isPrivateRoom = window.location.pathname.includes("/private");
    const roomData = await (isPrivateRoom
      ? roomService.getPrivateRoom(roomId)
      : roomService.getPublicRoom(roomId)
    )
      .then((response) => response.data)
      .catch(() => navigate("/"));

    if (!roomData.active) navigate("/");
    else if (!roomData?.public && !authState.isAuthenticated)
      return navigate("/");

    setRoom(roomData);
    const nickname = localStorage.getItem("username");
    if (nickname) setNickname(nickname);
    else setOpenModal(true);

    loadingService.hideLoader();
  };

  useEffect(() => {
    if (nickname && roomId) {
      if (wsToken) {
        getRoomState(roomId);
        setHasJoined(true);
      }
      else {
        signRoom({
          type: "signinRoom",
          roomId,
          nickname,
        });
      };
    }
  }, [nickname]);

  useEffect(() => {
      if (notifications.length) {
        setNotification(notifications[0]);
      };
    }, [notifications]);

  const setNotification = (notification: notification) => {
    checkNotification();
    const { type, data } = notification;
    const { _id: roomId, nickname, users } = data;

    switch (type) {
      case "roomState":
        setRoomState(users);
        break;
      case "updateRoom":
        if (roomId !== room?._id) return;
        setRoom(data);
        showToast("success", "Sala atualizada com sucesso.");
        break;
      case "signinRoom":
        showToast("info", `${nickname} entrou na sala.`);
        break;
      case "signinReply":
        const { token } = data;
        if (token) setWsToken(token);
        getRoomState(roomId, authState.user?._id);
        setHasJoined(true);
        break;
      case "signoutRoom":
        showToast("info", `${nickname} saiu da sala.`);
        break;
    };
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      {hasJoined && nickname && room && (
        <ChatWindow
          room={room}
          nickname={nickname}
          usersNumber={roomState}
          onLeave={() => navigate("/")}
        />
      )}
      <RegisterModal
        isOpen={openModal}
        onClose={() => location.reload()}
      />
    </div>
  );
};