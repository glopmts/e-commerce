import { z } from "zod";
import { auth } from "../../../lib/auth/auth";
import { protectedProcedure, publicProcedure, router } from "../init";

export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      const user = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      });

      return { success: true, user };
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
      });

      return { success: true, session };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    await auth.api.signOut({
      headers: new Headers(),
    });

    return { success: true };
  }),

  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
