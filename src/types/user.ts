export interface User {
  _id: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}