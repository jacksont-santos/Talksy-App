import { HttpService } from './httpService';
import { FormRoom } from '../types/room';

const CHAT_MANAGER_URL = import.meta.env.VITE_CHAT_MANAGER_URL;

class RoomService {

  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService(CHAT_MANAGER_URL);
  }

  public async getPrivateRooms() {
    return this.httpService.get('/room/private');
  }

  public async getPublicRooms() {
    return this.httpService.get('/room');
  }

  public async getPrivateRoom(roomId: string) {
    return this.httpService.get(`/room/private/${roomId}`);
  }

  public async getPublicRoom(roomId: string) {
    return this.httpService.get(`/room/id/${roomId}`);
  }

  public async createRoom(data: FormRoom) {
    return this.httpService.post('/room/create', data);
  }

  public async updateRoom(roomId: string, data: FormRoom) {
    return this.httpService.put(`/room/update/${roomId}`, data);
  }

  public async deleteRoom(roomId: string) {
    return this.httpService.delete(`/room/delete/${roomId}`);
  }

  public async getRoomMessages(roomId: string, page: number = 1, limit: number = 20) {
    return this.httpService.get(`/room/messages/${roomId}`, { params: { page, limit } });
  }
}

export const roomService = new RoomService();