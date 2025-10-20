import { db } from "@/lib/prisma";
import {
  type DeleteProductInput,
  type ToggleProductStatusInput,
  createProductInput,
  deleteProductInput,
  getProductBySlugInput,
  getProductsInput,
  productCountOutput,
  productDetailOutput,
  productListOutput,
  productMutationOutput,
  toggleProductStatusInput,
  updateProductInput,
} from "@/lib/schemas/product-schemas";
import { TRPCError } from "@trpc/server";
import { object, z } from "zod";
import { publicProcedure, router } from "../../init";

export const productRouter = router({
  getProducts: publicProcedure
    .input(getProductsInput)
    .query(async ({ input }) => {
      try {
        const {
          page = 1,
          limit = 20,
          categoryId,
          categorySlug,
          isActive,
          isFeatured,
          minPrice,
          maxPrice,
          inStock,
          search,
          thumbnail,
          sortBy = "createdAt",
          sortOrder = "desc",
        } = input;

        const where: any = {
          ...(categoryId && { categoryId }),
          ...(isActive !== undefined && { isActive }),
          ...(isFeatured !== undefined && { isFeatured }),
        };

        if (categorySlug) {
          where.category = {
            slug: categorySlug,
          };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
          where.price = {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          };
        }

        if (inStock !== undefined) {
          where.OR = [
            { trackStock: false },
            { trackStock: true, stock: { gt: 0 } },
          ];
        }

        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ];
        }

        const [products, totalCount] = await Promise.all([
          db.product.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
            include: {
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              variants: {
                where: {
                  isActive: true,
                },
                include: {
                  size: true,
                  color: true,
                },
              },
              attributes: true,
              _count: {
                select: {
                  reviews: true,
                  wishlist: true,
                },
              },
            },
          }),
          db.product.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
          products,
          pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            hasNextPage,
            hasPrevPage,
            limit,
          },
        };
      } catch (error) {
        console.error("Error fetching products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar os produtos",
        });
      }
    }),
  getProductsLimits: publicProcedure
    .input(
      object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const limit = input.limit;

        const products = await db.product.findMany({
          take: limit || 3,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            images: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return products;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar os produtos por limites",
        });
      }
    }),

  getProductBySlug: publicProcedure
    .input(getProductBySlugInput)
    .output(productDetailOutput)
    .query(async ({ input }) => {
      try {
        const product = await db.product.findUnique({
          where: { slug: input.slug },
          include: {
            images: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
            variants: {
              include: {
                size: true,
                color: true,
              },
              orderBy: {
                name: "asc",
              },
            },
            attributes: {
              orderBy: {
                name: "asc",
              },
            },
            reviews: {
              where: {
                isApproved: true,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            _count: {
              select: {
                wishlist: true,
                reviews: true,
              },
            },
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        }

        return product;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar o produto",
        });
      }
    }),

  getProductsByCategory: publicProcedure
    .input(
      z.object({
        categorySlug: z.string(),
        limit: z.number().int().positive().max(100).default(20),
        page: z.number().int().positive().default(1),
      })
    )
    .output(productListOutput)
    .query(async ({ input }) => {
      try {
        const products = await db.product.findMany({
          where: {
            category: {
              slug: input.categorySlug,
              isActive: true,
            },
            isActive: true,
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            images: {
              where: {
                isPrimary: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            variants: {
              where: {
                isActive: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                wishlist: true,
              },
            },
          },
        });

        return products;
      } catch (error) {
        console.error("Error fetching products by category:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar produtos por categoria",
        });
      }
    }),

  // ✅ CRIAR PRODUTO
  createProduct: publicProcedure
    .input(createProductInput)
    .output(productMutationOutput)
    .mutation(async ({ input }) => {
      try {
        const { images, variants, attributes, ...productData } = input;

        const product = await db.product.create({
          data: {
            ...productData,
            images: images
              ? {
                  create: images.map((img) => ({
                    url: img.url,
                    altText: img.altText,
                    sortOrder: img.sortOrder,
                    isPrimary: img.isPrimary,
                  })),
                }
              : undefined,
            variants: variants
              ? {
                  create: variants.map((variant) => ({
                    name: variant.name,
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.stock,
                    isActive: variant.isActive,
                    sizeId: variant.sizeId,
                    colorId: variant.colorId,
                  })),
                }
              : undefined,
            attributes: attributes
              ? {
                  create: attributes.map((attr) => ({
                    name: attr.name,
                    value: attr.value,
                  })),
                }
              : undefined,
          },
          include: {
            images: true,
            variants: {
              include: {
                size: true,
                color: true,
              },
            },
            attributes: true,
            category: true,
          },
        });

        return {
          success: true,
          message: "Produto criado com sucesso",
          product,
        };
      } catch (error) {
        console.error("Error creating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar produto",
        });
      }
    }),

  updateProduct: publicProcedure
    .input(updateProductInput)
    .output(productMutationOutput)
    .mutation(async ({ input }) => {
      try {
        const { id, images, variants, attributes, ...updateData } = input;

        // Verificar se o produto existe
        const existingProduct = await db.product.findUnique({
          where: { id },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        }

        const product = await db.product.update({
          where: { id },
          data: {
            ...updateData,
            ...(images !== undefined && {
              images: {
                deleteMany: {},
                create: images.map((img) => ({
                  url: img.url,
                  altText: img.altText,
                  sortOrder: img.sortOrder,
                  isPrimary: img.isPrimary,
                })),
              },
            }),
            ...(attributes !== undefined && {
              attributes: {
                deleteMany: {},
                create: attributes.map((attr) => ({
                  name: attr.name,
                  value: attr.value,
                })),
              },
            }),
          },
          include: {
            images: true,
            variants: {
              include: {
                size: true,
                color: true,
              },
            },
            attributes: true,
            category: true,
          },
        });

        return {
          success: true,
          message: "Produto atualizado com sucesso",
          product,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error updating product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar produto",
        });
      }
    }),

  deleteProduct: publicProcedure
    .input(deleteProductInput)
    .output(productMutationOutput)
    .mutation(async ({ input }: { input: DeleteProductInput }) => {
      try {
        const existingProduct = await db.product.findUnique({
          where: { id: input.id },
          include: {
            orderItems: true,
          },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        }

        if (existingProduct.orderItems.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não é possível excluir produto com pedidos associados",
          });
        }

        await db.$transaction(async (tx) => {
          // Excluir relações primeiro
          await tx.productImage.deleteMany({
            where: { productId: input.id },
          });

          await tx.productAttribute.deleteMany({
            where: { productId: input.id },
          });

          await tx.productVariant.deleteMany({
            where: { productId: input.id },
          });

          await tx.review.deleteMany({
            where: { productId: input.id },
          });

          await tx.wishlistItem.deleteMany({
            where: { productId: input.id },
          });

          await tx.cartItem.deleteMany({
            where: { productId: input.id },
          });

          // Excluir produto
          await tx.product.delete({
            where: { id: input.id },
          });
        });

        return {
          success: true,
          message: "Produto excluído com sucesso",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Error deleting product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir produto",
        });
      }
    }),

  toggleProductStatus: publicProcedure
    .input(toggleProductStatusInput)
    .output(productMutationOutput)
    .mutation(async ({ input }: { input: ToggleProductStatusInput }) => {
      try {
        const product = await db.product.update({
          where: { id: input.id },
          data: {
            isActive: input.isActive,
          },
          include: {
            images: true,
            category: true,
          },
        });

        return {
          success: true,
          message: `Produto ${
            input.isActive ? "ativado" : "desativado"
          } com sucesso`,
          product,
        };
      } catch (error) {
        console.error("Error toggling product status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao alterar status do produto",
        });
      }
    }),

  getProductsCount: publicProcedure
    .input(
      z
        .object({
          categoryId: z.string().cuid().optional(),
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .output(productCountOutput)
    .query(async ({ input }) => {
      try {
        const where = {
          ...(input?.categoryId && { categoryId: input.categoryId }),
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
        };

        const count = await db.product.count({ where });

        return { count };
      } catch (error) {
        console.error("Error counting products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao contar produtos",
        });
      }
    }),

  getFeaturedProducts: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().max(50).default(10),
        })
        .optional()
    )
    .output(productListOutput)
    .query(async ({ input }) => {
      try {
        const products = await db.product.findMany({
          where: {
            isFeatured: true,
            isActive: true,
          },
          take: input?.limit || 10,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            images: {
              where: {
                isPrimary: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                wishlist: true,
              },
            },
          },
        });

        return products;
      } catch (error) {
        console.error("Error fetching featured products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar produtos em destaque",
        });
      }
    }),
});
