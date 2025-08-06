import { useState, useEffect } from "react";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { StoredRoom } from "../../types/room";
import { MessageType } from "../../contexts/WebSocketContext";

export const RoomMemoryHandler = () => {

  const {
    getSignState,
    notifications,
    checkNotification,
    connected
  } = useWebSocket();

  const [ storedRooms, setStoredRooms ] = useState<StoredRoom[]>([]);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    }
  }, [notifications]);

  useEffect(() => {
    if (!connected) return;
    const rooms = localStorage.getItem("rooms");
    if (rooms) {
      const data: StoredRoom[] = JSON.parse(rooms);
      setStoredRooms(data);
      data.forEach((item) => getSignState(item.id, item.token));
    };
  }, [connected]);

  const setNotification = (notification: notification) => {
    const { type, data } = notification;

    if (type == MessageType.SIGN_STATE) {
      checkNotification(notification.id);
      const { _id: roomId, authenticated } = data;
  
      if (!authenticated && storedRooms.length) {
        const currentRooms = storedRooms.filter((item) => item.id !== roomId);
        setStoredRooms(currentRooms);
        if (currentRooms.length) localStorage.setItem("rooms", JSON.stringify(currentRooms));
        else localStorage.removeItem("rooms");
      };
    };
  };

  return (null)
};
