import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { Room, FormRoom } from "../types/room";
import { useWebSocket, notification } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { RoomCard } from '../components/rooms/RoomCard';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import { PlusCircle } from 'lucide-react';
import { useLoading } from '../contexts/LoadingContext';
import { RegisterModal } from '../components/auth/RegisterModal';

export const Home: React.FC = () => {

  const loadingService = useLoading();
  const navigate = useNavigate();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [fetchedPublicRooms, setFetchedPublicRooms] = useState(false);
  const [fetchedPrivateRooms, setFetchedPrivateRooms] = useState(false);
  const [roomsState, setRoomsState] = useState<Map<string, number>>(new Map());

  const [nickname, setNickname] = useState('');

  const {
    setWsToken,
    connectPublic,
    connectPrivate,
    getRoomsState,
    checkNotification,
    notifications,
    connected,
  } = useWebSocket();
  const { authState } = useAuth();

  useEffect(() => {
    loadingService.showLoader();
    if (!connected) return;
    
    roomService.getPublicRooms()
    .then((response) => {
      setPublicRooms((list) => ([
        ...list,
        ...response.data
      ]));
      connectPublic();
      getRoomsState();
    })
    .catch((error) => {
      if (error.status !== 404)
        loadingService.setMessage('Erro ao carregar as salas');
    })
    .finally(() => {
      setFetchedPublicRooms(true);
    });
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    if (authState.isAuthenticated) {
      if (authState.user?.username) {
        setNickname(authState.user.username);
      };
      setFetchedPrivateRooms(false);
      roomService.getPrivateRooms()
      .then((response) => {
        setPrivateRooms((list) => ([
          ...list,
          ...response.data
        ]));
        connectPrivate(authState.user!._id);
        getRoomsState(authState.user!._id);
      })
      .catch((error) => {
        if (error.status !== 404)
          loadingService.setMessage('Erro ao carregar as salas');
      })
      .finally(() => {
        setFetchedPrivateRooms(true);
      });
    }
    else {
      const username = localStorage.getItem('username');
      if (username) setNickname(username);
      else setIsRegisterModalOpen(true);

      setPrivateRooms([]);
      setFetchedPrivateRooms(true);
    };
  }, [connected, authState.isAuthenticated]);

  useEffect(() => {
    if (fetchedPublicRooms && fetchedPrivateRooms)
      loadingService.hideLoader();

  }, [fetchedPublicRooms, fetchedPrivateRooms]);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    };
  }, [notifications]);

  const handleDeleteRoom = (roomId: string) => {
    roomService.deleteRoom(roomId);
  };

  const saveRoom = (roomData: FormRoom) => {
    if (editingRoom)
      roomService.updateRoom(editingRoom._id, roomData);
    else
      roomService.createRoom(roomData);

    setIsCreateModalOpen(false);
    setEditingRoom(null);
  }

  const onCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    const username = localStorage.getItem('username');
    if (username) setNickname(username);
  };

  const setNotification = (notification: notification) => {
    checkNotification();
    const { type, data } = notification;
    const { _id: roomId, public: isPublic } = data;

    const rooms = publicRooms.concat(privateRooms);
    const setRoom = isPublic ? setPrivateRooms : setPublicRooms;

    switch (type) {
      case 'addRoom':
        const existentRoom = rooms.find((room) => room._id === roomId);
        if (existentRoom) return;
        setRoom((list) => [
          ...list,
          data
        ]);
        break;

      case "updateRoom":
        setRoom((list) => {
          return list.map((room) => {
            return room._id === roomId ? data : room;
          });
        });
        break;

      case "removeRoom":
        setRoom((list) => {
          return list.filter((room) => room._id !== roomId);
        });
        break;
      case "roomsState":
        setRoomsState(() => {
          const { rooms } = data;
          if (!rooms || !rooms.length) return new Map();
          return new Map(
            rooms.map(
              (room: { roomId: string; users: string }) => [room.roomId, room.users]
            )
          );
        });
        break;
      case "signinReply":
        const { token } = data;
        if (token) setWsToken(token);
        const room = rooms.find((room) => room._id === roomId);
        if (!room) return;
        navigate(`/${room.public ? 'public' : 'private'}/${room._id}`);
        break;
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* <RoomList rooms={rooms} authState={authState} /> */}
    <div>
      {authState.isAuthenticated && (
      <div className="flex justify-end items-center mb-6 w-full">
        {/* <h1 className="text-2xl font-bold text-gray-900">Salas disponíneis</h1> */}
        
          <Button 
            onClick={() => {
              setEditingRoom(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center transition-transform hover:scale-105"
          >
            <PlusCircle size={18} className="mr-2" />
            Criar sala
          </Button>
      </div>
      )}
      
      {publicRooms.length > 0 && (
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Salas publicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicRooms.map(room => (
          <RoomCard
            key={room._id}
            room={room}
            userId={authState.user?._id}
            nickname={nickname}
            usersNumber={(roomsState.get(room._id) || 0)}
            isOwner={authState.isAuthenticated && authState.user?._id === room.ownerId}
            onEdit={() => {
              setEditingRoom(room);
              setIsCreateModalOpen(true);
            }}
            onDelete={() => handleDeleteRoom(room._id)}
          />
        ))}
        </div>
        </div>
      )}
      {privateRooms.length > 0 && (
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">Salas privadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {privateRooms.map(room => (
          <RoomCard
            key={room._id}
            room={room}
            userId={authState.user?._id}
            nickname={nickname}
            usersNumber={(roomsState.get(room._id) || 0)}
            isOwner={authState.isAuthenticated && authState.user?._id === room.ownerId}
            onEdit={() => {
              setEditingRoom(room);
              setIsCreateModalOpen(true);
            }}
            onDelete={() => handleDeleteRoom(room._id)}
          />
        ))}
        </div>
        </div>
      )}
      {!publicRooms.length && !privateRooms.length && (
        <div className="flex flex-col items-center justify-center size-full">
        <span className="mt-4 text-blue-600 dark:text-gray-500 text-lg font-medium">
          Nenhuma sala encontrada.
        </span>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Recarregar
        </Button>
        </div>
      )}
      
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
    </div>
    </div>
  );
};