import { headers } from "next/headers";
import { auth } from "../../lib/auth/auth";

export async function createContext() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return {
    session,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
