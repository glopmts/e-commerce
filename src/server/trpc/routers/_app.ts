import { initTRPC } from "@trpc/server";
import { authRouter } from "./auth";
import { userRouter } from "./user";

const t = initTRPC.create();

export const appRouter = t.router({
  user: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
