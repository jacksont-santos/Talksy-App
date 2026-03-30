import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";

export enum MessageType {
  PUBLIC = "public",
  PRIVATE = "private",
  ADD_ROOM = "addRoom",
  UPDATE_ROOM = "updateRoom",
  REMOVE_ROOM = "removeRoom",
  FIRST_SIGNIN_ROOM = "firstSigninRoom",
  SIGNIN_ROOM = "signinRoom",
  SIGNOUT_ROOM = "signoutRoom",
  SIGNIN_REPLY = "signinReply",
  SIGNOUT_REPLY = "signoutReply",
  UPDATE_ROOM_STATE = "updateRoomState",
  ROOM_STATE = "roomState",
  ROOMS_STATE = "roomsState",
  CHAT = "chat",
}

interface messageParams {
  roomId: string;
  content: string;
  nickname: string;
}

export interface notification {
  type: MessageType;
  data: any;
  id: string;
}

interface WebSocketContextType {
  connect: (authToken: string) => void;
  firstSigninRoom: (roomId: string, password?: string) => void;
  signinRoom: (roomId: string) => void;
  signoutRoom: (roomId: string) => void;
  sendMessage: (params: messageParams) => void;
  getRoomState: (roomId: string) => void;
  getRoomsState: () => void;
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

  const maxReconnectAttempts = import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS;
  const reconnectDelay = import.meta.env.VITE_RECONNET_DELAY;
  
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const [notifications, setNotifications] = useState<notification[]>([]);
  const [wsToken, setWsToken] = useState("");

  const WebSocketInit = () => {
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

    WebSocketInit();
    return () => {
      if (socket.current?.readyState) {
        socket.current?.close();
      }
    };
  }, [reconnectAttempts]);

  const connect = (authToken: string) => {
    if (socket.current?.readyState)
      socket.current?.send(JSON.stringify({ type: "connection", authToken }));
  };
  const firstSigninRoom = (roomId: string, password?: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.FIRST_SIGNIN_ROOM,
          data: { roomId, password },
        })
      );
    }
  };
  const signinRoom = (roomId: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.SIGNIN_ROOM,
          data: { roomId },
        })
      );
    }
  };
  const signoutRoom = (roomId: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.SIGNOUT_ROOM,
          data: { roomId },
        })
      );
    }
  };
  const sendMessage = ({
    roomId,
    content,
    nickname,
  }: messageParams) => {
    if (socket.current?.readyState) {
      const message = {
        roomId,
        content,
        nickname,
      };
      socket.current?.send(
        JSON.stringify({ type: "chat", data: message })
      );
    }
  };

  const getRoomState = (roomId: string) => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.ROOM_STATE,
          data: { roomId },
        })
      );
    }
  };

  const getRoomsState = () => {
    if (socket.current?.readyState) {
      socket.current?.send(
        JSON.stringify({
          type: MessageType.ROOMS_STATE,
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
        connect,
        firstSigninRoom,
        signinRoom,
        signoutRoom,
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
