import { db } from "@/lib/prisma";

import { TRPCError } from "@trpc/server";
import { object, z } from "zod";
import { publicProcedure, router } from "../../init";

export const categoryRouter = router({
  getCategories: publicProcedure.query(async () => {
    try {
      const categories = await db.category.findMany({
        include: {
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  altText: true,
                },
              },
            },
          },
        },
      });
      return categories;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
      });
    }
  }),
  getCategoryById: publicProcedure
    .input(
      object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const category = await db.category.findUnique({
          where: {
            id: input.id,
          },
          include: {
            products: {
              select: {
                id: true,
                title: true,
                price: true,
                images: {
                  select: {
                    url: true,
                    altText: true,
                  },
                },
              },
            },
          },
        });
        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }
        return category;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch category",
        });
      }
    }),
  getProductByIdInput: publicProcedure
    .input(
      object({
        slug: z.string(),
        name: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await db.product.findMany({
          where: {
            category: {
              slug: input.slug,
            },
          },
          include: {
            images: true,
          },
          take: input.limit || 8,
        });

        return products;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products for the given category",
        });
      }
    }),
});
