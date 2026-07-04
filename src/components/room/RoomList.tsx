import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Room, FormRoom } from "../../types/room";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { useToastContext } from "../common/ToasterProvider";
import { useServices } from "../../contexts/ServicesContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../common/Button";
import { RoomCard } from "./RoomCard";
import { CreateRoomModal } from "./CreateRoomModal";
import { DeleteModal } from "./DeleteRoomModal";
import { useLoading } from "../../contexts/LoadingContext";
import { JoinRoomModal } from "../chat/JoinRoomModal";
import { MessageType } from "../../contexts/WebSocketContext";
import { timer } from "../../utils/timer";

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
  const { roomService } = useServices();
  const { showToast } = useToastContext();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [participantRooms, setParticipantRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [roomsFetched, setRoomsFetched] = useState(false);
  const [roomsState, setRoomsState] = useState<Map<string, number>>(new Map());

  const [searchParams, setSearchParams] = useSearchParams();
  const [retry, setRetry] = useState(true);

  const {
    connect,
    firstSigninRoom,
    signinRoom,
    checkNotification,
    notifications,
    connected,
  } = useWebSocket();
  const { authState } = useAuth();

  useEffect(() => {
    if (!connected) return;
    if (authState.isAuthenticated && authState.token) {
      connect(authState.token);
      getRooms();
    }
  }, [connected, authState.isAuthenticated, retry]);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    }
  }, [notifications]);

  useEffect(() => {
    if (roomsFetched) {
      const queryId = searchParams.get("room");
      const token = searchParams.get("token");
      if (queryId && token) {
        getInvitedRoom(queryId, token);
      } else {
        setTimeout(() => loadingService.finishLoader(), 400);
      }
    }
  }, [roomsFetched]);

  const getRooms = async () => {
    if (!retry) return;
    await Promise.all([
      roomService.getPublicRooms(),
      roomService.getPrivateRooms(),
      roomService.getParticipantRooms(),
    ])
      .then(([publicResponse, privateResponse, participantResponse]) => {
        setSectionRooms("public", publicResponse.data);
        setSectionRooms("private", privateResponse.data);
        setSectionRooms("participant", participantResponse.data);
      })
      .catch(async (error) => {
        if (error?.code === "ECONNREFUSED") {
          setRetry(false);
          showToast("error", "Não foi possível conectar ao servidor.");
        } else if (error.status !== 404) {
          await timer(400);
          loadingService.setMessage("Erro ao carregar as salas");
          resetRooms();
        }
      });
    setRoomsFetched(true);
  };

  const setSectionRooms = (
    section: "public" | "private" | "participant",
    rooms: any,
  ) => {
    switch (section) {
      case "public":
        setPublicRooms((list) => [...list, ...rooms]);
        break;
      case "private":
        setPrivateRooms((list) => [...list, ...rooms]);
        break;
      case "participant":
        setParticipantRooms((list) => [...list, ...rooms]);
        break;
    }
  };

  const resetRooms = () => {
    setPublicRooms([]);
    setPrivateRooms([]);
    setParticipantRooms([]);
  };

  const getInvitedRoom = async (query: string, token: string) => {
    const invitedRoom = await roomService
      .getInvitedRoom(query, token)
      .then((response) => response.data)
      .catch(async (error) => {
        console.log(error);
        await timer(400);
        loadingService.setMessage("Erro ao carregar a sala");
      });
      if (!invitedRoom) return;
      await timer(400);
      loadingService.finishLoader();
      if (isMember(invitedRoom)) signinRoom(invitedRoom._id);
      else {
        setSelectedRoom(invitedRoom);
        setIsJoinModalOpen(true);
      }
  };

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
    if (isMember(room)) {
      signIn(room._id);
      return;
    };
    if (room.public || !room.public && isOwner(room.ownerId)) {
      firstSignIn(room._id);
      return;
    };
    if (!room.public && !isOwner(room.ownerId)) {
      setSelectedRoom(room);
      setIsJoinModalOpen(true);
      return;
    };
    if (roomIdJoined === room._id) {
      onSelect();
    };
  }

  const isMember = (room: Room) => {
    const currentRoom = participantRooms.find((item) => item._id === room._id);
    return !!currentRoom;
  };

  const firstSignIn = (roomId: string, password?: string) => {
    firstSigninRoom(roomId, password);
    setLoading(true);
    setIsJoinModalOpen(false);
  };

  const signIn = (roomId: string) => {
    signinRoom(roomId);
    setLoading(true);
    setIsJoinModalOpen(false);
  };

  const showRoomState = (room: Room) => {
    if (!room.public && roomIdJoined !== room._id && !isOwner(room.ownerId))
      return;
    return (roomsState.get(room._id) || 0) + "";
  };

  const removeParam = (param: string) => {
    if (searchParams.has(param)) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete(param);
      setSearchParams(newParams);
    };
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
    const existentRoom = rooms.find((room) => room._id === roomId);
    const setRoom = isPublic ? setPublicRooms : setPrivateRooms;

    switch (type) {
      case MessageType.ADD_ROOM:
        if (!existentRoom) setRoom((list) => [...list, data]);
        break;

      case MessageType.UPDATE_ROOM:
        setParticipantRooms((list) => list.map((room) => room._id === roomId ? data : room));
        if (isPublic) {
          setPrivateRooms((list) => list.filter((room) => room._id !== roomId));
          setPublicRooms((list) => {
              const roomExists = list.some((room) => room._id === roomId);
              if (!roomExists) return [...list, data];
              return list.map((room) => room._id === roomId ? data : room);
            });
        }
        else {
          setPublicRooms((list) => list.filter((room) => room._id !== roomId));
          if (data.ownerId === authState.user?._id) {
            setPrivateRooms((list) => {
              const roomExists = list.some((room) => room._id === roomId);
              if (!roomExists) return [...list, data];
              return list.map((room) => room._id === roomId ? data : room);
            });
          }
        }

        break;

      case MessageType.REMOVE_ROOM:
        setRoom((list) => list.filter((room) => room._id !== data.roomId));
        setParticipantRooms((list) => list.filter((room) => room._id !== data.roomId));
        break;

      case MessageType.ROOMS_STATE:
        setRoomsState(() => {
          const { rooms } = data;
          if (!rooms || !rooms.length) return new Map();
          return new Map(
            rooms.map((room: { roomId: string; users: string }) => [
              room.roomId,
              room.users,
            ]),
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
        if (!existentRoom && !selectedRoom) return;
        setIsJoinModalOpen(false);
        onSelect(existentRoom || selectedRoom!);
        removeParam("room");
        removeParam("token");
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
              Membro
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
            <p className="text-sm text-gray-500">{publicRooms.length} salas</p>
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

      {isJoinModalOpen && selectedRoom && (
        <JoinRoomModal
          roomName={selectedRoom.name}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={(password) => firstSignIn(selectedRoom._id, password)}
        />
      )}
    </div>
  );
};
