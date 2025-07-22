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
import { StoredRoom } from "../types/room";
import { MessageType } from "../contexts/WebSocketContext";

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

  const messagesToReceive = [
    MessageType.ROOM_STATE,
    MessageType.UPDATE_ROOM,
    MessageType.SIGNIN_ROOM,
    MessageType.SIGNOUT_ROOM,
    MessageType.SIGNIN_REPLY,
  ];

  useEffect(() => {
    loadingService.showLoader();
    if (authState.isLoading) return;
    joinRoom();
    // return () => {
    //   if (roomId)
    //     localStorage.removeItem(`room:${roomId}`);
    // }
  }, [authState.isLoading]);

    const joinRoom = async () => {
    if (!roomId) return navigate("/");
    const isPrivateRoom = window.location.pathname.includes("/private");
    const roomData = await (isPrivateRoom
      ? roomService.getPrivateRoom(roomId)
      : roomService.getPublicRoom(roomId)
    )
      .then((response) => response.data)
      .catch(() => {
        showToast("error", "Sala não encontrada.");
        navigate("/")
      });

      console.log('aqui', roomData )
    if (!roomData.active) navigate("/");
    else if (!roomData?.public && !authState.isAuthenticated)
      return navigate("/");
    console.log('aqui2', authState)

    setRoom(roomData);
    const nickname = localStorage.getItem("nickname");
    if (nickname) setNickname(nickname);
    else setOpenModal(true);

    loadingService.hideLoader();
  };

  useEffect(() => {
    if (nickname && roomId) {
      // const storedRooms = localStorage.getItem('rooms');
      // const data = storedRooms ? JSON.parse(storedRooms) : [];
      // const wsTokenStored = !data ? null : data?.find((item: StoredRoom) => item.id === roomId)?.token;
      // if (wsTokenStored) setWsToken(wsTokenStored);
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
    const { type, data } = notification;

    if (!messagesToReceive.includes(type)) return;
    checkNotification();

    const { _id: roomId, nickname, users } = data;

    switch (type) {
      case MessageType.ROOM_STATE:
        if (roomId == room?._id) setRoomState(users);
        break;
      case MessageType.UPDATE_ROOM:
        if (roomId !== room?._id) return;
        setRoom(data);
        showToast("success", "Sala atualizada com sucesso.");
        break;
      case MessageType.SIGNIN_ROOM:
        setRoomState(users);
        showToast("info", `${nickname} entrou na sala.`);
        break;
      case MessageType.SIGNOUT_ROOM:
        showToast("info", `${nickname} deixou a sala.`);
        setRoomState(users);
        break;
      case MessageType.SIGNIN_REPLY:
        const { token } = data;
        if (token) {
          let storedRooms = localStorage.getItem('rooms');
          if (storedRooms) {
            const rooms: StoredRoom[] = JSON.parse(storedRooms);
            const room = rooms.find((item) => item.id === roomId);
            if (room) room.token = token;
            else rooms.push({id: roomId, token });
            localStorage.setItem('rooms', JSON.stringify(rooms) );
          }
          else localStorage.setItem('rooms', JSON.stringify([{id: roomId, token }]) );
          setWsToken(token);
        };
        getRoomState(roomId);
        setHasJoined(true);
        break;
    };
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      {hasJoined && nickname && room && wsToken && (
        <ChatWindow
          room={room}
          nickname={nickname}
          token={wsToken}
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