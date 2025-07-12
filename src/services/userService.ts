import { HttpService } from './httpService';

const CHAT_MANAGER_URL = import.meta.env.VITE_CHAT_MANAGER_URL;

export interface userAuth {
    username: string;
  password: string;
}

class UserService {

  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService(CHAT_MANAGER_URL);
  }

  public async getUser() {
    return this.httpService.get('/user');
  }

  public async createUserAccount(data: userAuth) {
    return this.httpService.post('/user/signup', data);
  }

  public async deleteUserAccount() {
    return this.httpService.delete(`/user/delete`);
  }

  public async signin(data: userAuth) {
    return this.httpService.post('/user/signin', data);
  }
}

export const userService = new UserService();