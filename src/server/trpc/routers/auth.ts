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

  // Recuperação de senha - Solicitar OTP
  forgetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await auth.api.forgetPassword({
          body: {
            email: input.email,
          },
        });

        return {
          success: true,
          message: "Código de verificação enviado para seu e-mail",
        };
      } catch (error) {
        return {
          success: false,
          message: "Erro ao solicitar recuperação de senha",
        };
      }
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await auth.api.resetPassword({
          body: {
            token: input.token,
            newPassword: input.newPassword,
          },
        });

        return {
          success: true,
          message: "Senha redefinida com sucesso",
        };
      } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return {
          success: false,
          message: "Token inválido ou expirado",
        };
      }
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
