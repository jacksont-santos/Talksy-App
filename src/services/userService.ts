import { HttpService } from './httpService';


export interface userAuth {
  username: string;
  password: string;
  nickname: string;
}

export class UserService {
  private httpService: HttpService;

  constructor(
    httpService: HttpService
  ) {
    this.httpService = httpService;
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

  public async signin(data: Omit<userAuth, 'nickname'>) {
    return this.httpService.post('/auth/signin', data);
  }
}
