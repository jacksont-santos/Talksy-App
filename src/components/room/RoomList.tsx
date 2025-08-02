import React, { useEffect, useState } from "react";
import { roomService } from "../../services/roomService";
import { Room, FormRoom } from "../../types/room";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../common/Button";
import { RoomCard } from "./RoomCard";
import { CreateRoomModal } from "./CreateRoomModal";
import { DeleteModal } from "./DeleteRoomModal";
import { useLoading } from "../../contexts/LoadingContext";
import { RegisterModal } from "../auth/RegisterModal";
import { StoredRoom } from "../../types/room";
import { JoinRoomModal } from "../chat/JoinRoomModal";
import { MessageType } from "../../contexts/WebSocketContext";

interface RoomListProps {
  onSelect: (value: Room) => void;
  setLoading: (loading: boolean) => void;
  session: "public" | "private";
}

export const RoomList: React.FC<RoomListProps> = ({
  onSelect,
  setLoading,
  session,
}) => {
  const loadingService = useLoading();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [fetchedPublicRooms, setFetchedPublicRooms] = useState(false);
  const [fetchedPrivateRooms, setFetchedPrivateRooms] = useState(false);
  const [roomsState, setRoomsState] = useState<Map<string, number>>(new Map());

  const [nickname, setNickname] = useState("");

  const {
    setWsToken,
    connectPublic,
    connectPrivate,
    signinRoom,
    checkNotification,
    notifications,
    connected,
  } = useWebSocket();
  const { authState } = useAuth();

  useEffect(() => {
    loadingService.showLoader();
    if (!connected || authState.isLoading) return;

    roomService
      .getPublicRooms()
      .then((response) => {
        setPublicRooms((list) => [...list, ...response.data]);
        if (!authState.isAuthenticated) connectPublic();
      })
      .catch((error) => {
        if (error.status !== 404)
          loadingService.setMessage("Erro ao carregar as salas");
      })
      .finally(() => {
        setFetchedPublicRooms(true);
      });
  }, [connected, authState.isLoading]);

  useEffect(() => {
    if (!connected) return;
    if (authState.isAuthenticated) {
      if (authState.user?.username) {
        setNickname(authState.user.username);
      }
      setFetchedPrivateRooms(false);
      roomService
        .getPrivateRooms()
        .then((response) => {
          setPrivateRooms((list) => [...list, ...response.data]);
          connectPrivate(authState.user!._id);
        })
        .catch((error) => {
          if (error.status !== 404)
            loadingService.setMessage("Erro ao carregar as salas");
        })
        .finally(() => {
          setFetchedPrivateRooms(true);
        });
    } else {
      setPrivateRooms([]);
      setFetchedPrivateRooms(true);
    }
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) setNickname(savedNickname);
    else setIsRegisterModalOpen(true);
  }, [connected, authState.isAuthenticated]);

  useEffect(() => {
    if (fetchedPublicRooms && fetchedPrivateRooms) loadingService.hideLoader();
  }, [fetchedPublicRooms, fetchedPrivateRooms]);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    }
  }, [notifications]);

  const isOwner = (ownerId: string) => {
    return authState.isAuthenticated && authState.user?._id === ownerId;
  };

  const saveRoom = (roomData: FormRoom) => {
    if (!selectedRoom || !authState.isAuthenticated) return;
    if (!isOwner(selectedRoom.ownerId)) return;

    roomService.updateRoom(selectedRoom._id, roomData);
    setIsCreateModalOpen(false);
    setSelectedRoom(null);
  };

  const deleteRoom = () => {
    if (!selectedRoom || !authState.isAuthenticated) return;
    if (!isOwner(selectedRoom.ownerId)) return;

    roomService.deleteRoom(selectedRoom._id);
    setIsDeleteModalOpen(false);
    setSelectedRoom(null);
  };

  const handleJoinRoom = (room: Room) => {
    if (!room.public && !isOwner(room.ownerId)) {
      setSelectedRoom(room);
      setIsJoinModalOpen(true);
      return;
    }
    sign(room._id);
  };

  const sign = (roomId: string, password?: string) => {
    signinRoom({
      roomId,
      nickname,
      password,
    });
    setLoading(true);
    setSelectedRoom(null);
    setIsJoinModalOpen(false);
  };

  const onCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) setNickname(savedNickname);
  };

  const timer = (time: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const messagesToReceive = [
    MessageType.ADD_ROOM,
    MessageType.UPDATE_ROOM,
    MessageType.REMOVE_ROOM,
    MessageType.ROOMS_STATE,
    MessageType.UPDATE_ROOM_STATE,
    MessageType.SIGNIN_REPLY,
  ];
  const setNotification = async (notification: notification) => {
    const { type, data } = notification;

    if (!messagesToReceive.includes(type)) return;
    checkNotification(notification.id);

    const { _id: roomId, public: isPublic } = data;

    const rooms = publicRooms.concat(privateRooms);
    const setRoom = isPublic ? setPublicRooms : setPrivateRooms;

    switch (type) {
      case MessageType.ADD_ROOM:
        const existentRoom = rooms.find((room) => room._id === roomId);
        if (existentRoom) return;
        setRoom((list) => [...list, data]);
        break;

      case MessageType.UPDATE_ROOM:
        setRoom((list) => {
          const newList = list.map((room) =>
            room._id === roomId ? data : room
          );
          return newList;
        });
        break;

      case MessageType.REMOVE_ROOM:
        setRoom((list) => {
          return list.filter((room) => room._id !== data.roomId);
        });
        break;
      case MessageType.ROOMS_STATE:
        setRoomsState(() => {
          const { rooms } = data;
          if (!rooms || !rooms.length) return new Map();
          return new Map(
            rooms.map((room: { roomId: string; users: string }) => [
              room.roomId,
              room.users,
            ])
          );
        });
        break;
      case MessageType.UPDATE_ROOM_STATE:
        const { users } = data;
        setRoomsState((state) => {
          state.set(roomId, users);
          return state;
        });
        break;
      case MessageType.SIGNIN_REPLY:
        await timer(400);
        setLoading(false);

        const room = rooms.find((room) => room._id === roomId);
        if (!room) return;
        const { token } = data;
        if (!token) {
          const storedRooms = localStorage.getItem("rooms");
          if (storedRooms) {
            let rooms: StoredRoom[] = JSON.parse(storedRooms);
            rooms = rooms.filter((item) => item.id !== roomId);
            if (rooms.length)
              localStorage.setItem("rooms", JSON.stringify(rooms));
            else localStorage.removeItem("rooms");
          }
        } else {
          const storedRooms = localStorage.getItem("rooms");
          if (storedRooms) {
            const rooms: StoredRoom[] = JSON.parse(storedRooms);
            const room = rooms.find((item) => item.id === roomId);
            if (room) room.token = token;
            else rooms.push({ id: roomId, token });
            localStorage.setItem("rooms", JSON.stringify(rooms));
          } else
            localStorage.setItem(
              "rooms",
              JSON.stringify([{ id: roomId, token }])
            );
          setWsToken(token);
          onSelect(room);
        }
        break;
    }
  };

  return (
    <div className="min-w-[340px] overflow-hidden flex flex-col bg-gray-200 dark:bg-zinc-900">
      <div className="py-3 px-6 flex justify-between items-center w-full shadow-sm">
        {session == "private" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Minhas salas
            </h3>
            <p className="text-sm text-gray-500">
              {authState.isAuthenticated ? privateRooms.length : 0} salas
            </p>
          </div>
        )}
        {session == "public" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Salas públicas
            </h3>
            <p className="text-sm text-gray-500">{publicRooms.length} salas</p>
          </div>
        )}
      </div>
      <div className="overflow-y-auto px-6">
        {publicRooms.length > 0 && session == "public" && (
          <div>
            <div className="flex flex-col gap-4">
              {publicRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  userId={authState.user?._id}
                  nickname={nickname}
                  usersNumber={roomsState.get(room._id) || 0}
                  isOwner={
                    authState.isAuthenticated &&
                    authState.user?._id === room.ownerId
                  }
                  onJoin={() => handleJoinRoom(room)}
                  onEdit={() => {
                    setSelectedRoom(room);
                    setIsCreateModalOpen(true);
                  }}
                  onDelete={() => {
                    setSelectedRoom(room);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {authState.isAuthenticated &&
          privateRooms.length > 0 &&
          session == "private" && (
            <div>
              <div className="flex flex-col gap-4">
                {privateRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    userId={authState.user?._id}
                    nickname={nickname}
                    usersNumber={roomsState.get(room._id) || 0}
                    isOwner={
                      authState.isAuthenticated &&
                      authState.user?._id === room.ownerId
                    }
                    onJoin={() => handleJoinRoom(room)}
                    onEdit={() => {
                      setSelectedRoom(room);
                      setIsCreateModalOpen(true);
                    }}
                    onDelete={() => {
                      setSelectedRoom(room);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {session == "private" && !authState.isAuthenticated && (
          <div className="flex flex-col items-center justify-center size-full">
            <span className="mt-4 text-gray-600 dark:text-gray-500 text-md">
              Faça login para ver suas salas privadas.
            </span>
            </div>
            )}
        {
          session == "public" && !publicRooms.length ||
          session == "private" && !privateRooms.length && authState.isAuthenticated && (
          <div className="flex flex-col items-center justify-center size-full">
            <span className="mt-4 text-gray-600 dark:text-gray-500 text-md">
              Nenhuma sala encontrada.
            </span>
            <Button className="mt-4" size="sm" variant="primary" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
          </div>
        )}
      </div>
      {isCreateModalOpen && (
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedRoom(null);
          }}
          onSave={saveRoom}
          room={selectedRoom}
        />
      )}
      {isDeleteModalOpen && selectedRoom && (
        <DeleteModal
          cancel={() => setIsDeleteModalOpen(false)}
          confirm={deleteRoom}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => onCloseRegisterModal()}
        />
      )}

      {isJoinModalOpen && selectedRoom && (
        <JoinRoomModal
          roomName={selectedRoom.name}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={(password) => sign(selectedRoom._id, password)}
        />
      )}
    </div>
  );
};
