import { initTRPC } from "@trpc/server";

import { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
