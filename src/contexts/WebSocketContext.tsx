import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Message } from "../types/message";
import { Room } from "../types/room";

export interface notification {
  type: 'addRoom' | 'updateRoom' | 'removeRoom' | 'joinRoom' | 'leaveRoom',
  data: any,
}

interface WebSocketContextType {
  connected: boolean;
  messages: Record<string, Message[]>;
  notifications: notification[];
  // rooms: Room[];
  sendMessage: (
    roomId: string,
    content: string,
    nickname: string,
    userId: string
  ) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL;

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const [notifications, setNotifications] = useState<notification[]>([]);
  // const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;

  const connect = () => {
    console.log(`Connecting to WebSocket server at ${WS_SERVER_URL}...`);
    const socketConnection = new WebSocket(WS_SERVER_URL);

    socketConnection.onerror = (error) => {
      console.error("WebSocket connection error:", error);
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
      console.log("WebSocket connection established");
      setConnected(true);
      setReconnectAttempts(0);
    };

    // if (socketConnection.readyState === WebSocket.OPEN) {
    //   socketConnection.onclose((socket, event) => {
    //     console.log("WebSocket connection closed:", event.reason);
    //     setConnected(false);
    //   });
    // }

      socketConnection.onmessage = (event) => {
        var msg = JSON.parse(event.data);
        var data = msg.data;
        // var time = new Date(msg.date);
        // var timeStr = time.toLocaleTimeString();

        setNotifications((notificationsList) => [
          ...notificationsList,
          {
            type: msg.type,
            data: data,
          }
        ]);
        
      
        // switch (msg.type) {
        //   case "addRoom":
        //     setRooms((list) => ([
        //       ...list,
        //       data
        //     ]));
        //     break;
        //   case "updateRoom":
        //     setRooms((list) => {
        //       return list.map((room) => {
        //         return room.id === data.id ? data : room;
        //       });
        //     });
        //     break;
        //   case "removeRoom":
        //     setRooms((list) => {
        //       return list.filter((room) => room.id !== data._id);
        //     });
        //     break;
        //   case "newMessage":
          
        // }
      };

    setSocket(socketConnection);
  };

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [reconnectAttempts]);

  useEffect(() => {
    console.log('effect');
    if (notifications.length) {
      setTimeout(() => {
        setNotifications(notificationsList => notificationsList.slice(1))
      }, 2000);
    }
  }, [notifications]);

  const joinRoom = (roomId: string) => {
    if (!connected) {
      console.error("Cannot join room: WebSocket not connected");
      return;
    }

    console.log(`Joining room: ${roomId}`);

    // Simulate joining room
    if (!messages[roomId]) {
      const welcomeMessage: Message = {
        id: `msg-${Date.now()}`,
        content: "Welcome to the chat room!",
        sender: {
          id: "system",
          nickname: "System",
        },
        roomId,
        timestamp: Date.now(),
      };

      setMessages((prev) => ({
        ...prev,
        [roomId]: [welcomeMessage],
      }));
    }

    // Simulate other users in the room
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg-${Date.now()}`,
        content: "Hello! Welcome to our chat room.",
        sender: {
          id: "bot",
          nickname: "ChatBot",
        },
        roomId,
        timestamp: Date.now(),
      };

      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), botMessage],
      }));
    }, 2000);
  };

  const leaveRoom = (roomId: string) => {
    if (!connected) {
      console.error("Cannot leave room: WebSocket not connected");
      return;
    }

    console.log(`Leaving room: ${roomId}`);

    // Simulate leaving room
    const leaveMessage: Message = {
      id: `msg-${Date.now()}`,
      content: "You have left the chat room.",
      sender: {
        id: "system",
        nickname: "System",
      },
      roomId,
      timestamp: Date.now(),
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), leaveMessage],
    }));
  };

  const sendMessage = (
    roomId: string,
    content: string,
    nickname: string,
    userId: string
  ) => {
    if (!connected) {
      console.error("Cannot send message: WebSocket not connected");
      return;
    }

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: {
        id: userId,
        nickname,
      },
      roomId,
      timestamp: Date.now(),
    };

    // Add message to state
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));

    // Simulate response from another user
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responseMessage: Message = {
          id: `msg-${Date.now()}`,
          content: `Thanks for your message, ${nickname}!`,
          sender: {
            id: "bot",
            nickname: "ChatBot",
          },
          roomId,
          timestamp: Date.now(),
        };

        setMessages((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), responseMessage],
        }));
      }, 1000 + Math.random() * 2000);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ connected, messages, notifications, sendMessage, joinRoom, leaveRoom }}
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
