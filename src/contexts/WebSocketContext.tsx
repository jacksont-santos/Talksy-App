import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { StoredRoom } from "../types/room";

export enum MessageType {
  PUBLIC = "public",
  PRIVATE = "private",
  ADD_ROOM = "addRoom",
  UPDATE_ROOM = "updateRoom",
  REMOVE_ROOM = "removeRoom",
  SIGNIN_ROOM = "signinRoom",
  SIGNOUT_ROOM = "signoutRoom",
  SIGNIN_REPLY = "signinReply",
  SIGNOUT_REPLY = "signoutReply",
  SIGN_STATE = "signState",
  UPDATE_ROOM_STATE = "updateRoomState",
  ROOM_STATE = "roomState",
  ROOMS_STATE = "roomsState",
  CHAT = "chat",
}

interface signinParams {
  roomId: string;
  nickname: string;
  password?: string;
  isPublic?: boolean;
}

interface signoutParams {
  roomId: string;
  nickname: string;
}

interface messageParams {
  roomId: string;
  content: string;
  nickname: string;
  token: string;
  userId?: string;
}

export interface notification {
  type: MessageType;
  data: any;
  id: string;
}

interface WebSocketContextType {
  connectPublic: () => void;
  connectPrivate: (authToken: string) => void;
  signinRoom: (params: signinParams) => void;
  signoutRoom: (params: signoutParams) => void;
  sendMessage: (params: messageParams) => void;
  getSignState: (_id: string, roomToken: string) => void;
  getRoomState: (roomId: string) => void;
  getRoomsState: (userId?: string) => void;
  checkNotification: (id: string) => void;
  setWsToken: (token: string) => void;
  wsToken: string;
  connected: boolean;
  notifications: notification[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL;

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const socket = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;

  const [notifications, setNotifications] = useState<notification[]>([]);
  const [wsToken, setWsToken] = useState("");

  const connect = () => {
    const socketConnection = new WebSocket(WS_SERVER_URL);

    socketConnection.onerror = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts((prev) => {
            const attempts = prev + 1;
            return attempts;
          });
        }, reconnectDelay);
      }
    };

    socketConnection.onopen = () => {
      setConnected(true);
      setReconnectAttempts(0);
    };

    socketConnection.onclose = () => {
      setConnected(false);
    };

    socketConnection.onmessage = (event) => {
      onMessage(event.data);
    };

    socket.current = socketConnection;
  };

  useEffect(() => {
    if (socket && socket.current?.readyState !== WebSocket.CLOSED)
      socket.current?.close();

    connect();
    return () => {
      if (socket.current?.readyState) {
        socket.current?.close();
      }
    };
  }, [reconnectAttempts]);

  const connectPublic = () => {
    if (socket.current?.readyState)
      socket.current?.send(JSON.stringify({ type: "connection" }));
  };
  const connectPrivate = (authToken: string) => {
    if (socket.current?.readyState)
      socket.current?.send(JSON.stringify({ type: "connection", authToken }));
  };
  const signinRoom = ({
    roomId,
    nickname,
    password,
    isPublic = true,
  }: signinParams) => {
    if (socket.current?.readyState) {
      const storedRooms = localStorage.getItem("rooms");
      const data = storedRooms ? JSON.parse(storedRooms) : [];
      const wsTokenStored = data?.find(
        (item: StoredRoom) => item.id === roomId
      )?.token;
      socket.current?.send(
        JSON.stringify({
          type: MessageType.SIGNIN_ROOM,
          data: {
            roomId,
            nickname,
            password,
            public: isPublic,
            roomToken: wsTokenStored,
          },
        })
      );
    }
  };
  const signoutRoom = ({ roomId, nickname }: signoutParams) => {
    if (socket.current?.readyState) {
      const storedRooms = localStorage.getItem("rooms");
      const data = storedRooms ? JSON.parse(storedRooms) : [];
      const wsTokenStored = data?.find(
        (item: StoredRoom) => item.id === roomId
      )?.token;
      socket.current?.send(
        JSON.stringify({
          type: MessageType.SIGNOUT_ROOM,
          data: { roomId, nickname, roomToken: wsTokenStored },
        })
      );
    }
  };
  const sendMessage = ({
    roomId,
    content,
    token,
    nickname,
    userId,
  }: messageParams) => {
    if (socket.current?.readyState) {
      const message = {
        roomId,
        content,
        token,
        nickname,
      };
      socket.current?.send(
        JSON.stringify({ type: "chat", userId, data: message })
      );
    }
  };

  const getRoomState = (roomId: string) => {
    if (socket.current?.readyState) {
      const authToken = localStorage.getItem("authToken");
      socket.current?.send(
        JSON.stringify({
          type: MessageType.ROOM_STATE,
          authToken,
          data: { roomId },
        })
      );
    }
  };

  const getRoomsState = (userId?: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.ROOMS_STATE,
          userId,
        })
      );
    }
  };

  const getSignState = (_id: string, roomToken: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.SIGN_STATE,
          data: { _id, roomToken },
        })
      );
    }
  };

  const checkNotification = (id: string) => {
    if (notifications.length)
      setNotifications((notificationsList) =>
        notificationsList.filter((notification) => notification.id !== id)
      );
  };

  const onMessage = (message: string) => {
    const msg = JSON.parse(message);
    const { type, data } = msg;
    setNotifications((notificationsList) => [
      ...notificationsList,
      {
        type,
        data,
        id: crypto.randomUUID(),
      },
    ]);
  };

  return (
    <WebSocketContext.Provider
      value={{
        connectPublic,
        connectPrivate,
        signinRoom,
        signoutRoom,
        getSignState,
        getRoomState,
        getRoomsState,
        sendMessage,
        setWsToken,
        checkNotification,
        wsToken,
        connected,
        notifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
