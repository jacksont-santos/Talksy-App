export interface Room {
  _id: string;
  name: string;
  active: boolean;
  public: boolean;
  maxUsers: number;
  ownerId: string;
}

export interface FormRoom {
  name: string;
  active: boolean;
  isPublic: boolean;
  maxUsers: number;
  password?: string;
}