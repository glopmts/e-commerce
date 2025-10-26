import { db } from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const likeReviewRoute = router({
  getLike: publicProcedure
    .input(z.object({ reviewId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const reviewId = input.reviewId;

        if (!reviewId) {
          return [];
        }

        const likes = await db.likeReview.findMany({
          where: { reviewId },
          include: {
            review: true,
          },
        });

        return likes;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar like review",
        });
      }
    }),

  addLikeReview: publicProcedure
    .input(z.object({ reviewId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado",
          });
        }

        const existingLikeReview = await db.likeReview.findFirst({
          where: {
            userId,
            reviewId: input.reviewId,
          },
        });

        if (existingLikeReview) {
          console.log("Favorite already exists:", existingLikeReview);
          return existingLikeReview;
        }

        // Cria novo favorite
        const newFavorite = await db.likeReview.create({
          data: {
            userId,
            reviewId: input.reviewId,
          },
        });

        console.log("Favorite created:", newFavorite);
        return newFavorite;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao adicionar Like review: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
        });
      }
    }),

  existingLikeReview: publicProcedure
    .input(z.object({ reviewId: z.string(), userId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          return false;
        }

        const existingLikeReview = await db.likeReview.findFirst({
          where: {
            userId,
            reviewId: input.reviewId,
          },
        });

        return !!existingLikeReview;
      } catch (error) {
        return false;
      }
    }),

  removeLikeReview: publicProcedure
    .input(z.object({ reviewId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = input.userId;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado",
          });
        }

        const existingLikeReview = await db.likeReview.findFirst({
          where: {
            userId,
            reviewId: input.reviewId,
          },
        });

        if (!existingLikeReview) {
          return { success: true, message: "Like review não existia" };
        }

        await db.likeReview.delete({
          where: {
            id: existingLikeReview.id,
          },
        });

        return { success: true, message: "Removido dos like review" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao remover like review: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
        });
      }
    }),
});
