"use client";

import { useEffect } from "react";
import { useSession } from "../../hooks/use-session";
import { Spinner } from "../ui/spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner type="" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
