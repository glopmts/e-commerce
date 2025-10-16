import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../init";

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        if (!input.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Você precisa estar logado",
          });
        }

        const user = await db.user.findUnique({
          where: {
            id: input.id,
          },
        });

        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar usuário" + error,
        });
      }
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.user.findUnique({
        where: {
          id: ctx.session?.user.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return user;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao buscar usuário",
      });
    }
  }),

  updaterUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Você precisa estar logado para atualizar perfil!",
          });
        }

        const user = await db.user.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuario não encontrado!",
          });
        }

        const userData = await db.user.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });

        return userData;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar usuário" + error,
        });
      }
    }),
});
