import { initTRPC } from "@trpc/server";
import { addressRouter } from "./address";
import { authRouter } from "./auth";
import { cartRoute } from "./cart-items";
import { categoryRouter } from "./products/category";
import { likeReviewRoute } from "./products/like-review";
import { productRouter } from "./products/product";
import { reviewRouter } from "./products/review";
import { userRouter } from "./user";

const t = initTRPC.create();

export const appRouter = t.router({
  user: userRouter,
  auth: authRouter,
  product: productRouter,
  cart: cartRoute,
  address: addressRouter,
  category: categoryRouter,
  review: reviewRouter,
  likeReview: likeReviewRoute,
});

export type AppRouter = typeof appRouter;
