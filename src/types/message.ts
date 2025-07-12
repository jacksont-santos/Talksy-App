export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    nickname: string;
  };
  roomId: string;
  timestamp: number;
}