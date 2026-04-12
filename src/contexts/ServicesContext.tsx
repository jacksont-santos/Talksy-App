import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { HttpService } from "../services/httpService";
import { RoomService } from "../services/roomService";
import { UserService } from "../services/userService";

type ServicesContextType = {
  httpService: HttpService;
  roomService: RoomService;
  userService: UserService;
};

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider = ({ children }: { children: ReactNode }) => {
  const CHAT_MANAGER_URL = import.meta.env.VITE_CHAT_MANAGER_URL;
  const httpService = new HttpService(CHAT_MANAGER_URL);
  const roomService = new RoomService(httpService);
  const userService = new UserService(httpService);

  return (
    <ServicesContext.Provider
      value={{ roomService, userService, httpService }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};
