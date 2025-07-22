import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { StoredRoom } from "../../types/room";

export const RoomMemoryHandler = () => {
  const { getRoomState, notifications, checkNotification, connected } = useWebSocket();

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
      data.forEach((item) => getRoomState(item.id));
    };
  }, [connected]);

  const setNotification = (notification: notification) => {
    const { type, data } = notification;

    if (type == "roomState") {
      checkNotification();
      const { _id: roomId, users } = data;
      if (users > 0) return;
      const storedRooms = localStorage.getItem("rooms");
      if (storedRooms) {
        let rooms: StoredRoom[] = JSON.parse(storedRooms);
        rooms = rooms.filter((item) => item.id !== roomId);
        localStorage.setItem("rooms", JSON.stringify(rooms));
      };
    };
  };

  return (null)
};
