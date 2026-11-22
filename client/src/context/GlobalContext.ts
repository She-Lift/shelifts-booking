import type { User } from '@src/services/auth-service';
import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export type GlobalContextType = {
  user: User | undefined;
  setUser: Dispatch<SetStateAction<User | undefined>>;
};

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function useGlobalContext() {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobalContext must be used within GlobalProvider.');
  }

  return context;
}
