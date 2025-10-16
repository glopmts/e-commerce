"use client";

import { useEffect } from "react";
import { useSession } from "../../hooks/use-session";
import { Spinner } from "../ui/spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner type="" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
