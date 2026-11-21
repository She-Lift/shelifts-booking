import { AuthService, type User } from '@src/services/auth-service';
import { HttpError } from '@src/services/http-service';
import { useEffect, useState, type ReactNode } from 'react';
import { GlobalContext } from './GlobalContext';

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(undefined);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const sessionUser = await AuthService.getSession();
        setUser(sessionUser);
      } catch (error) {
        setUser(undefined);
        if (error instanceof HttpError && error.status === 401) {
          setUser(undefined);
          return;
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  return <GlobalContext value={{ user, setUser, isLoading }}>{children}</GlobalContext>;
}
