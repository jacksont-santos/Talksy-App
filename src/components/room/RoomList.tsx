import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { roomService } from "../../services/roomService";
import { Room, FormRoom } from "../../types/room";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { useToastContext } from "../common/ToasterProvider";
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
  onSelect: (value?: Room) => void;
  setLoading: (loading: boolean) => void;
  display: boolean;
  isMobile: boolean;
  session: "public" | "private" | "participant";
  roomIdJoined?: string;
}

export const RoomList: React.FC<RoomListProps> = ({
  onSelect,
  setLoading,
  display,
  isMobile,
  session,
  roomIdJoined,
}) => {
  const loadingService = useLoading();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const { showToast } = useToastContext();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [participantRooms, setParticipantRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [fetchedPublicRooms, setFetchedPublicRooms] = useState(false);
  const [fetchedPrivateRooms, setFetchedPrivateRooms] = useState(false);
  const [roomsState, setRoomsState] = useState<Map<string, number>>(new Map());
  const [nickname, setNickname] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const [retry, setRetry] = useState(true);

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
    if (!authState.isAuthenticated) connectPublic();
    roomService
      .getPublicRooms()
      .then((response) => {
        setPublicRooms((list) => [...list, ...response.data]);
      })
      .catch((error) => {
        console.log(error);
        if (error?.code === "ECONNREFUSED")
          setRetry(false);
        else if (error.status !== 404)
          loadingService.setMessage("Erro ao carregar as salas");
      })
      .finally(() => {
        setFetchedPublicRooms(true);
      });
  }, [connected, authState.isLoading, retry]);

  useEffect(() => {
    if (!connected) return;
    if (authState.isAuthenticated && authState.token) {
      if (authState.user?.username) {
        setNickname(authState.user.username);
      }
      connectPrivate(authState.token);
      setFetchedPrivateRooms(false);
      roomService
        .getPrivateRooms()
        .then((response) => {
          setPrivateRooms((list) => [...list, ...response.data]);
        })
        .catch((error) => {
          console.log(error);
          if (error?.code === "ECONNREFUSED")
            setRetry(false);
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
  }, [connected, authState.isAuthenticated, retry]);

  useEffect(() => {
    if (fetchedPublicRooms && fetchedPrivateRooms) loadingService.hideLoader();
  }, [fetchedPublicRooms, fetchedPrivateRooms]);

  useEffect(() => {
    let storedParticipantRooms: any = localStorage.getItem("participant");

    const roomsToQuery = storedParticipantRooms
      ? [...(JSON.parse(storedParticipantRooms) as string[])]
      : [];
    const query = searchParams.get("room");
    if (query) roomsToQuery.push(query);

    const promises = roomsToQuery.map((roomId: string) =>
      roomService.getPrivateRoom(roomId)
    );

    Promise.allSettled(promises).then((responses) => {
      const rooms = responses
        .filter((response) => response.status === "fulfilled")
        .map((response) => response.value.data);
      if (!rooms || !rooms.length) return;
      setParticipantRooms(rooms);

      const invitedRoom = rooms.find((room) => room._id === query);
      if (!invitedRoom) {
        showToast("error", "Sala não encontrada.");
        return;
      };
      setSelectedRoom(invitedRoom);
      setIsJoinModalOpen(true);
    });
  }, []);

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
    if (roomIdJoined === room._id) {
      onSelect();
      return;
    }
    sign(room);
  };

  const sign = (room: Room, password?: string) => {
    signinRoom({
      roomId: room._id,
      isPublic: room.public,
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

  const showRoomState = (room: Room) => {
    if (!room.public && roomIdJoined !== room._id && !isOwner(room.ownerId)) return;
    return (roomsState.get(room._id) || 0) + "";
  }

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

    const rooms = publicRooms.concat(privateRooms).concat(participantRooms);
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
          } else {
            localStorage.setItem(
              "rooms",
              JSON.stringify([{ id: roomId, token }])
            );
          };

          setWsToken(token);
          onSelect(room);

          if (searchParams.has("room")) {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("room");
            setSearchParams(newParams);
          };
        };
        break;
    }
  };

  return (
    <div
      className={`
      ${
        !display ? "w-[0px]" : !isMobile ? "w-[340px]" : "w-[100%]"
      } md:max-w-[340px] transition-all duration-150 ease-in-out 
      h-full overflow-hidden flex flex-col bg-gray-200 dark:bg-zinc-900
    `}
    >
      <div className="py-3 px-6 flex justify-between items-center w-full shadow-sm">
        {session == "participant" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Participante
            </h3>
            <p className="text-sm text-gray-500">
              {participantRooms.length} salas
            </p>
          </div>
        )}
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
            <p className="text-sm text-gray-500">
              {publicRooms.length} salas
            </p>
          </div>
        )}
      </div>
      <div className="overflow-y-auto overflow-x-hidden px-6">
        {participantRooms.length > 0 && session == "participant" && (
          <div>
            <div className="flex flex-col gap-4">
              {participantRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  userId={authState.user?._id}
                  nickname={nickname}
                  usersNumber={showRoomState(room)}
                  isOwner={false}
                  onJoin={() => handleJoinRoom(room)}
                />
              ))}
            </div>
          </div>
        )}
        {publicRooms.length > 0 && session == "public" && (
          <div>
            <div className="flex flex-col gap-4">
              {publicRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  userId={authState.user?._id}
                  nickname={nickname}
                  usersNumber={showRoomState(room)}
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
                    usersNumber={showRoomState(room)}
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
        {(session == "public" && !publicRooms.length) ||
          (session == "private" &&
            !privateRooms.length &&
            authState.isAuthenticated && (
              <div className="flex flex-col items-center justify-center size-full">
                <span className="mt-4 text-gray-600 dark:text-gray-500 text-md">
                  Nenhuma sala encontrada.
                </span>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Recarregar
                </Button>
              </div>
            ))}
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
          onJoin={(password) => sign(selectedRoom, password)}
        />
      )}
    </div>
  );
};
