import { type User } from '@src/services/auth-service';
import { useEffect, useState, type ReactNode } from 'react';
import { GlobalContext } from './global-context';

interface GlobalProviderProps {
  initialUser: User | null;
  children: ReactNode;
}

export default function GlobalProvider({ initialUser, children }: GlobalProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [prevInitialUser, setPrevInitialUser] = useState<User | null>(initialUser);

  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return <GlobalContext value={{ user, setUser }}>{children}</GlobalContext>;
}
