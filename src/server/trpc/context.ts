import { headers } from "next/headers";
import { auth } from "../../lib/auth/auth";
import { db } from "../../lib/prisma";

export async function createContext() {
  const headersList = await headers();

  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    return {
      db,
      user: session?.user || null,
      session: session || null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
