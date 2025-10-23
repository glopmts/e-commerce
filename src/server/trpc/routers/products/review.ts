import { db } from "@/lib/prisma";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../../init";

export const reviewRouter = router({
  getReviewsByProductId: publicProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.productId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product ID is required",
          });
        }
        const reviews = await db.review.findMany({
          where: {
            productId: input.productId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        return reviews;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reviews",
        });
      }
    }),

  existsReviewByUserAndProduct: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.productId || !input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product ID and User ID are required",
          });
        }
        const review = await db.review.findFirst({
          where: {
            productId: input.productId,
            userId: input.userId,
          },
        });
        return review !== null;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check review existence",
        });
      }
    }),
  createReview: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        userId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(500),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (
          !input.productId ||
          !input.userId ||
          !input.rating ||
          !input.comment
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All fields are required",
          });
        }

        const reviewExists = await db.review.findFirst({
          where: {
            productId: input.productId,
            userId: input.userId,
          },
        });
        if (reviewExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User has already reviewed this product",
          });
        }
        const review = await db.review.create({
          data: {
            productId: input.productId,
            userId: input.userId,
            rating: input.rating,
            comment: input.comment,
            images: input.images || [],
          },
        });
        return review;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create review",
        });
      }
    }),
  deleteReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.reviewId || !input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Review ID and User ID are required",
          });
        }

        const review = await db.review.findUnique({
          where: {
            id: input.reviewId,
          },
        });

        if (!review) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Review not found",
          });
        }

        if (review.userId !== input.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this review",
          });
        }

        const deletedReview = await db.review.delete({
          where: {
            id: input.reviewId,
          },
        });
        return deletedReview;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete review",
        });
      }
    }),
});
