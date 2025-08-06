import React, { useEffect, useState, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { useWebSocket, notification } from "../../contexts/WebSocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { Room } from "../../types/room";
import { roomService } from "../../services/roomService";
import { ArrowDownIcon, LogOutIcon, Link, Save } from "lucide-react";

interface ChatWindowProps {
  room: Room;
  nickname: string;
  token: string;
  usersNumber?: number;
  onLeave: (roomId: string) => void;
}

export interface Message {
  id: string;
  content: string;
  nickname: string;
  createdAt: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  nickname,
  token,
  usersNumber = 0,
  onLeave,
}) => {
  const { sendMessage, notifications, checkNotification } = useWebSocket();
  const { authState } = useAuth();
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [iteractivityInited, setIteractivityInited] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setPage(1);
    setLimit(20);
    setRoomMessages([]);
    const fetchMessages = async () => {
      try {
        const response = await roomService.getRoomMessages(room._id);
        setRoomMessages(response.data);
      } catch (error) {
        console.error("Error fetching room messages:", error);
      }
    };
    fetchMessages();
    container.current?.addEventListener("scroll", () => {
      if (container.current?.scrollTop === 0) {
        setPage((prevPage) => prevPage + 1);
      }
    });
  }, [room._id]);

  useEffect(() => {
    if (page == 1) return;
    handleLoadMore();
  }, [page]);

  useEffect(() => {
    if (roomMessages.length === 0 || iteractivityInited) return;
    setIteractivityInited(true);
    goToBottom();
  }, [roomMessages]);

  useEffect(() => {
    if (notifications.length) {
      setNotification(notifications[0]);
    }
  }, [notifications]);

  const setNotification = (notification: notification) => {
    const { type, data } = notification;
    if (type !== "chat") return;
    const { id, roomId, content, nickname, createdAt } = data;
    checkNotification(notification.id);
    if (roomId !== room._id) return;
    setRoomMessages((prevMessages) => [
      ...prevMessages,
      { id, content, nickname, createdAt },
    ]);
  };

  const handleLoadMore = async () => {
    try {
      if (loadingMoreMessages) return;
      setLoadingMoreMessages(true);

      const previousScrollHeight = container.current?.scrollHeight || 0;

      const response = await roomService.getRoomMessages(room._id, page, limit);
      if (response.data.length === 0) {
        setLoadingMoreMessages(false);
        return;
      }
      setRoomMessages((prevMessages) => [...response.data, ...prevMessages]);
      setTimeout(() => {
        const newScrollHeight = container.current?.scrollHeight || 0;
        const heightDiff = newScrollHeight - previousScrollHeight || 0;
        if (container.current) container.current.scrollTop = heightDiff;
      }, 0);
      setLoadingMoreMessages(false);
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!nickname)
      return alert("Please set a nickname before sending messages.");

    sendMessage({
      roomId: room._id,
      content,
      nickname,
      token,
      userId: authState.user?._id,
    });
  };

  const goToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}?room=${room._id}`;
    navigator.clipboard
      .writeText(roomLink)
      .then(() => {
        alert("Link copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar o link:", err);
        alert("Erro ao copiar o link. Tente novamente.");
      });
  };

  const hasLink = () => !room.public && room.ownerId === authState.user?._id;

  const saveRoom = () => {
    const participantRooms = localStorage.getItem("participant");
    if (participantRooms) {
      const rooms: string[] = JSON.parse(participantRooms);
      if (rooms.includes(room._id)) return;
      rooms.push(room._id);
      localStorage.setItem("participant", JSON.stringify(rooms));
    } else {
      localStorage.setItem("participant", JSON.stringify([room._id]));
    };
    alert("Sala salva com sucesso!");
  }

  const isInvited = () => !room.public && room.ownerId != authState.user?._id;

  return (
    <div className="flex flex-col h-full">
      <div className="dark:bg-[#161616] py-3 px-6 flex justify-between items-center flex-wrap gap-y-4">
        <div>
          <h2 className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-200">
            {room.name}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            {usersNumber} / {room.maxUsers} Participantes
          </p>
        </div>
        <div>
          {isInvited() && (
            <button
              onClick={() => saveRoom()}
              className="p-[0.25rem] md:p-2 mr-2 bg-gray-400 dark:bg-gray-600 text-white hover:bg-indigo-700 rounded transition-colors"
            >
              <span title="Salvar sala">
                <Save className="size-[12px] md:size-[16px]" />
              </span>
            </button>
          )}
          {hasLink() && (
            <button
              onClick={() => copyRoomLink()}
              className="p-[0.25rem] md:p-2 mr-2 bg-gray-400 dark:bg-gray-600 text-white hover:bg-indigo-700 rounded transition-colors"
            >
              <span title="Copiar Link da Sala">
                <Link className="size-[12px] md:size-[16px]" />
              </span>
            </button>
          )}
          <button
            onClick={() => onLeave(room._id)}
            className="p-[0.25rem] md:p-2 bg-gray-400 dark:bg-gray-600 text-white hover:bg-indigo-700 rounded transition-colors"
          >
            <span title="Deixar Sala">
              <LogOutIcon className="rotate-180 size-[12px] md:size-[16px]" />
            </span>
          </button>
        </div>
      </div>

      <div
        ref={container}
        className="flex-grow dark:bg-[#161616] overflow-y-auto px-6 rounded-md"
      >
        {roomMessages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          roomMessages.map((message) => (
            <MessageItem
              key={message.id}
              currentUserNamer={nickname}
              message={message}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <button
        onClick={goToBottom}
        className="bg-gray-600 text-white px-3 py-3 fixed bottom-24 right-6 rounded-md hover:bg-indigo-700 transition-colors"
      >
        <ArrowDownIcon size={18} />
      </button>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};
