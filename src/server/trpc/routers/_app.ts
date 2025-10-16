import { initTRPC } from "@trpc/server";
import { addressRouter } from "./address";
import { authRouter } from "./auth";
import { cartRoute } from "./cart-items";
import { productRouter } from "./products/product";
import { userRouter } from "./user";

const t = initTRPC.create();

export const appRouter = t.router({
  user: userRouter,
  auth: authRouter,
  product: productRouter,
  cart: cartRoute,
  address: addressRouter,
});

export type AppRouter = typeof appRouter;
