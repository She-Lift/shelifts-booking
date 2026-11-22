import { type User } from '@src/services/auth-service';
import { useEffect, useState, type ReactNode } from 'react';
import { GlobalContext } from './GlobalContext';

interface GlobalProviderProps {
  initialUser?: User;
  children: ReactNode;
}

export default function GlobalProvider({ initialUser, children }: GlobalProviderProps) {
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [prevInitialUser, setPrevInitialUser] = useState<User | undefined>(initialUser);

  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }

  useEffect(() => {
    const handleUnauthorized = () => setUser(undefined);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return <GlobalContext value={{ user, setUser }}>{children}</GlobalContext>;
}
