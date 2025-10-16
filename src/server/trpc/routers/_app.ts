import { initTRPC } from "@trpc/server";
import { authRouter } from "./auth";
import { productRouter } from "./products/product";
import { userRouter } from "./user";

const t = initTRPC.create();

export const appRouter = t.router({
  user: userRouter,
  auth: authRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
