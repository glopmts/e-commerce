"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "../server/trpc/client";

type User = {
  id: string;
  email: string;
  name: string | null;
} | null;

type SessionContextType = {
  user: User;
  isLoading: boolean;
  refetch: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data, refetch } = trpc.auth.getSession.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (data) {
      setUser(data.user);
      setIsLoading(false);
    }
  }, [data]);

  const handleRefetch = () => {
    refetch();
  };

  return (
    <SessionContext.Provider
      value={{ user, isLoading, refetch: handleRefetch }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
