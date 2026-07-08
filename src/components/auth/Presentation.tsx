import {
  MessageCircleMore,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const messages = [
  {
    author: "Talksy",
    avatar: "MessageCircleMore",
    text: "Bem-vindo ao ChatRoom! 👋",
    side: "left",
    bg: "bg-[#f3f3f3]",
    color: "text-[#ffffff]",
  },
  {
    author: "Encontre sua comunidade",
    avatar: "Users",
    text: "Participe de salas sobre diferentes assuntos e conecte-se com pessoas incríveis.",
    side: "right",
    bg: "bg-[#24bbff]",
    color: "text-[#24bbff]",
  },
  {
    author: "Converse livremente",
    avatar: "MessageSquare",
    text: "Troque mensagens em tempo real e acompanhe tudo o que está acontecendo.",
    side: "left",
    bg: "bg-[#22c55e]",
    color: "text-[#22c55e]",
  },
  {
    author: "Comece em segundos",
    avatar: "Zap",
    text: "Escolha uma sala ou crie a sua e comece a conversar agora mesmo",
    side: "right",
    bg: "bg-[#ffa929]",
    color: "text-[#ffa929]",
  },
];

interface PresentationProps {
    onStart: () => void;
}

export function Presentation({ onStart }: PresentationProps) {
  return (
    <div className="flex-grow rounded-3xl shadow-2xl overflow-y-auto">
      <div className="space-y-5 p-6">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.45,
              delay: index * 1.2,
            }}
            className={`flex ${message.side === "right" ? "justify-end" : ""}`}
          >
            <div
              className={`flex md:max-w-[85%] gap-3 ${
                message.side === "right" ? "flex-row-reverse" : ""
              }`}
            >
              <div className="">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${message.bg}`}
                >
                  {message.avatar === "MessageCircleMore" ? (
                    <MessageCircleMore fill="#03a9f4" size={28} />
                  ) : message.avatar === "Users" ? (
                    <Users fill="#eeeeee" size={20} />
                  ) : message.avatar === "MessageSquare" ? (
                    <MessageSquare fill="#f7fdff" size={20} />
                  ) : message.avatar === "Zap" ? (
                    <Zap fill="#f7fdff" size={20} />
                  ) : (
                    <span>{message.avatar}</span>
                  )}
                </div>
              </div>

              <div
                className={`rounded-3xl px-4 py-3 shadow ${
                  message.side === "left" ? "bg-[#f4f4f50d]" : "bg-[#4f46e52e]"
                }`}
              >
                <p
                  className={`text-sm font-semibold text-left ${message.color}`}
                >
                  {message.author}
                </p>

                <p className="mt-1 text-xs leading-5 text-left text-white">
                  {message.text}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 5.8,
        }}
        className="p-6 pt-0"
      >
        <button
          onClick={onStart}
          className="font-semibold text-white transition hover:bg-indigo-700
          rounded-full bg-indigo-600 px-5 py-3 text-center text-sm mb-6 m-x-auto w-fit
          "
        >
          Tudo pronto para começar sua primeira conversa? Começar
        </button>
      </motion.div>
    </div>
  );
}