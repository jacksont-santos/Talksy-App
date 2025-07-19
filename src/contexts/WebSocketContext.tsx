import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";

enum MessageType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ADD_ROOM = 'addRoom',
  UPDATE_ROOM = 'updateRoom',
  REMOVE_ROOM = 'removeRoom',
  SIGNIN_ROOM = 'signinRoom',
  SIGNOUT_ROOM = 'signoutRoom',
  SIGNIN_REPLY = 'signinReply',
  UPDATE_ROOM_STATE = 'updateRoomState',
  ROOM_STATE = 'roomState',
  ROOMS_STATE = 'roomsState',
  CHAT = 'chat',
}

interface signParams {
  type: 'signinRoom' | 'signoutRoom';
  roomId: string;
  nickname: string;
  password?: string;
  isPublic?: boolean;
  userId?: string;
}

interface messageParams {
  roomId: string,
  content: string,
  nickname: string,
  userId?: string
}

export interface notification {
  type: MessageType,
  data: any,
}

interface WebSocketContextType {
  connectPublic: () => void;
  connectPrivate: (userId: string) => void;
  signRoom: (params: signParams) => void;
  sendMessage: (params: messageParams) => void;
  getRoomState: (roomId: string, userId?: string) => void;
  getRoomsState: (userId?: string) => void;
  checkNotification: () => void;
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
  const [wsToken, setWsToken] = useState('');

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

  // useEffect(() => {
  //   if (notifications.length) {
  //     setTimeout(() => {
  //       setNotifications(notificationsList => notificationsList.slice(1))
  //     }, 2000);
  //   }
  // }, [notifications]);

  const checkNotification = () => {
    if (notifications.length)
      setNotifications(notificationsList => notificationsList.slice(1))
  }

  const connectPublic = () => {
    if (socket.current?.readyState)
      socket.current?.send(JSON.stringify({ type: "public" }));
  };
  const connectPrivate = (userId: string) => {
    if (socket.current?.readyState)
      socket.current?.send(JSON.stringify({ type: "private", userId }));
  };
  const signRoom = ({
    type,
    roomId,
    nickname,
    isPublic = true,
    userId
  }: signParams) => {
    if (socket.current?.readyState) {
      socket.current?.send(JSON.stringify({
        type,
        userId,
        data: {
          roomId,
          nickname,
          public: isPublic,
          token: localStorage.getItem(`room:${roomId}`)
        }
      }));
    };
  };
  const sendMessage = ({
    roomId,
    content,
    nickname,
    userId
  }: messageParams) => {
    if (socket.current?.readyState) {
      const message = {
        roomId,
        content,
        nickname,
      };
      socket.current?.send(JSON.stringify({ type: "chat", userId, data: message }));
    }
  };
  const getRoomState = (roomId: string, userId?: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(JSON.stringify({
        type: MessageType.ROOM_STATE, 
        userId,
        data: { roomId }
      }));
    }
  };
  const getRoomsState = (userId?: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(JSON.stringify({
        type: MessageType.ROOMS_STATE, 
        userId
      }));
    }
  };

  const onMessage = (message: string) => {
    const msg = JSON.parse(message);
    const { type, data } = msg;
    setNotifications((notificationsList) => [
      ...notificationsList,
      {
        type,
        data,
      },
    ]);
  }

  return (
    <WebSocketContext.Provider
      value={{
        connectPublic,
        connectPrivate,
        signRoom,
        sendMessage,
        getRoomState,
        getRoomsState,
        setWsToken,
        checkNotification,
        wsToken,
        connected,
        notifications
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
