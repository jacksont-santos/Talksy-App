import React, { useEffect, useState } from 'react';
import { roomService } from '../services/roomService';
import { Room, FormRoom } from "../types/room";
import { useWebSocket, notification } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { RoomCard } from '../components/rooms/RoomCard';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import { PlusCircle } from 'lucide-react';
import { useLoading } from '../contexts/LoadingContext';


export const Home: React.FC = () => {

  const loadingService = useLoading();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = useState<Room[]>([]);
  const [fetchedPublicRooms, setFetchedPublicRooms] = useState(false);
  const [fetchedPrivateRooms, setFetchedPrivateRooms] = useState(false);

  const { notifications } = useWebSocket();
  const { authState } = useAuth();

  useEffect(() => {
    roomService.getPublicRooms()
    .then((response) => {
      setPublicRooms((list) => ([
        ...list,
        ...response.data
      ]));
    })
    .catch((error) => {
      if (error.status !== 404)
        loadingService.setMessage('Erro ao carregar as salas');
    })
    .finally(() => {
      setFetchedPublicRooms(true);
    });
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) {
      setFetchedPrivateRooms(false);
      roomService.getPrivateRooms()
      .then((response) => {
        setPrivateRooms((list) => ([
          ...list,
          ...response.data
        ]));
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
      setPrivateRooms([]);
      setFetchedPrivateRooms(true);
    };
  }, [authState.isAuthenticated]);

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

  const setNotification = (notification: notification) => {

    const rooms = publicRooms.concat(privateRooms);
    const setRoom = notification.data.public ? setPrivateRooms : setPublicRooms;

    switch (notification.type) {

      case "addRoom":
        const existentRoom = rooms.find((room) => room._id === notification.data._id);
        if (existentRoom) return;

        setRoom((list) => [
          ...list,
          notification.data
        ]);
        break;

      case "updateRoom":
        setRoom((list) => {
          return list.map((room) => {
            return room._id === notification.data._id ? notification.data : room;
          });
        });
        break;

      case "removeRoom":
        setRoom((list) => {
          return list.filter((room) => room._id !== notification.data._id);
        });
        break;
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* <RoomList rooms={rooms} authState={authState} /> */}
    <div>
      <div className="flex justify-end items-center mb-6 w-full">
        {/* <h1 className="text-2xl font-bold text-gray-900">Salas disponíneis</h1> */}
        {authState.isAuthenticated && (
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
        )}
      </div>
      
      {publicRooms.length > 0 && (
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Salas publicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicRooms.map(room => (
          <RoomCard
            key={room._id}
            room={room}
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
    </div>
    </div>
  );
};