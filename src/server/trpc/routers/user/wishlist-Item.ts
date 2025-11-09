import { db } from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const favoriteRoute = router({
  getFavorite: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          return [];
        }

        const likes = await db.wishlistItem.findMany({
          where: { userId },
          include: {
            product: true,
          },
        });

        return likes;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar favorite",
        });
      }
    }),

  addFavorite: publicProcedure
    .input(z.object({ productId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado",
          });
        }

        const existingFavorite = await db.wishlistItem.findFirst({
          where: {
            userId,
            productId: input.productId,
          },
        });

        if (existingFavorite) {
          return existingFavorite;
        }

        // Cria novo favorite
        const newFavorite = await db.wishlistItem.create({
          data: {
            userId,
            productId: input.productId,
          },
        });

        return newFavorite;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao adicionar aos favorites: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
        });
      }
    }),

  existingFavorite: publicProcedure
    .input(z.object({ productId: z.string(), userId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          return false;
        }

        const existingFavorite = await db.wishlistItem.findFirst({
          where: {
            userId,
            productId: input.productId,
          },
        });

        return !!existingFavorite;
      } catch (error) {
        return false;
      }
    }),

  removeLikeReview: publicProcedure
    .input(z.object({ productId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado",
          });
        }

        const existingFavorite = await db.wishlistItem.findFirst({
          where: {
            userId,
            productId: input.productId,
          },
        });

        if (!existingFavorite) {
          return { success: true, message: "Favorite não existia" };
        }

        await db.likeReview.delete({
          where: {
            id: existingFavorite.id,
          },
        });

        return { success: true, message: "Removido dos aos favorites" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao remover aos favorites: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
        });
      }
    }),
});
