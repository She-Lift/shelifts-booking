import { createContext, type Dispatch, type SetStateAction } from "react";
import { useContext } from "react";

export type User = {
  id: number;
  username: string;
  role: "admin" | "customer";
  mustChangePassword: boolean;
};

export type GlobalContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoading: boolean;
};

export const GlobalContext = createContext<GlobalContextType | null>(null);

export function useGlobalContext() {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalContext must be used within GlobalProvider."
    );
  }

  return context;
}