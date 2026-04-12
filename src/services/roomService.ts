import { HttpService } from './httpService';
import { FormRoom } from '../types/room';


export class RoomService {

  private httpService: HttpService;

  constructor(
    httpService: HttpService
  ) {
    this.httpService = httpService;
  }

  public async getPrivateRooms() {
    return this.httpService.get('/room/private');
  }

  public async getPublicRooms() {
    return this.httpService.get('/room');
  }

  public async getParticipantRooms() {
    return this.httpService.get('/room/member');
  }

  public async getPrivateRoom(roomId: string) {
    return this.httpService.get(`/room/private/id/${roomId}`);
  }

  public async getInvitedRoom(roomId: string, token: string) {
    return this.httpService.get(`/room/invited/${roomId}/token/${token}`);
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
