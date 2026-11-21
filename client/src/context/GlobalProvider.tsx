import { useEffect, useState, type ReactNode } from "react";
import { GlobalContext, type User } from "./GlobalContext";

export function GlobalProvider({ children }: { children: ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "same-origin",
          signal: controller.signal
        });

        if (response.status === 401) {
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Could not verify session.");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Session check failed:", error);
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    return () => controller.abort();
  }, []);

  return <>
    <GlobalContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </GlobalContext.Provider>
  </>;
}