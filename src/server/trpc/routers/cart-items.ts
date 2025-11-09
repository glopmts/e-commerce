import { db } from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../init";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const cartRoute = router({
  createCart: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, productId, quantity } = input;

        if (!productId || !userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required fields",
          });
        }

        const existingCartItem = await db.cartItem.findFirst({
          where: {
            userId,
            productId,
          },
        });

        if (existingCartItem) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Product already in cart",
          });
        }

        const existingProduct = await db.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const cart = await db.cartItem.create({
          data: {
            userId,
            productId,
            quantity,
          },
        });

        return {
          status: 201,
          cart,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create cart: " + error,
        });
      }
    }),
  // Adicione esta procedure no seu router cartRoute
  addOrUpdateCart: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, productId, quantity } = input;

        const product = await db.product.findUnique({
          where: { id: productId },
          select: { stock: true, isActive: true },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        }

        if (!product.isActive || product.stock < quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Produto indisponível ou estoque insuficiente",
          });
        }

        const existingItem = await db.cartItem.findFirst({
          where: {
            userId,
            productId,
          },
        });

        let cartItem;

        if (existingItem) {
          cartItem = await db.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity },
          });
        } else {
          cartItem = await db.cartItem.create({
            data: {
              userId,
              productId,
              quantity,
            },
          });
        }

        return {
          status: 200,
          cartItem,
          action: existingItem ? "updated" : "created",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao atualizar carrinho",
        });
      }
    }),
  existingProductCart: publicProcedure
    .input(
      z.object({
        productId: z.array(z.string()),
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing userId",
          });
        }

        const existingItems = await db.cartItem.findMany({
          where: {
            userId: input.userId,
            productId: { in: input.productId },
          },
          select: {
            productId: true,
            quantity: true,
          },
        });

        return {
          status: 200,
          data: input.productId.map((productId) => ({
            productId,
            exists: existingItems.some((item) => item.productId === productId),
            quantity:
              existingItems.find((item) => item.productId === productId)
                ?.quantity || 0,
          })),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve cart items: " + error,
        });
      }
    }),
  updateCartQuantity: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        cartId: z.string().min(1, "Cart ID is required"),
        quantity: z
          .number()
          .int()
          .min(1)
          .max(100, "Quantity must be between 1 and 100"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, cartId, quantity } = input;

        const product = await db.cartItem.findUnique({
          where: { id: cartId },
          select: {
            id: true,
            product: {
              select: {
                title: true,
                price: true,
                thumbnail: true,
                stock: true,
              },
            },
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (product.product.stock == null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product stock information is unavailable",
          });
        }

        if (quantity > product.product.stock) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Only ${product.product.stock} items available in stock`,
          });
        }

        const existingCartItem = await db.cartItem.findFirst({
          where: {
            userId,
            id: cartId,
          },
        });

        if (!existingCartItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Item not found in cart",
          });
        }

        await db.cartItem.updateMany({
          where: {
            userId,
            id: cartId,
          },
          data: {
            quantity,
            updatedAt: new Date(),
          },
        });

        const updatedItem = await db.cartItem.findFirst({
          where: {
            userId,
            id: cartId,
          },
          include: {
            product: {
              select: {
                title: true,
                price: true,
                thumbnail: true,
                stock: true,
              },
            },
          },
        });

        return {
          status: 200,
          message: "Cart updated successfully",
          cart: updatedItem,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update cart",
        });
      }
    }),
  deleteCart: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        cartId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, cartId } = input;

        if (!cartId || !userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Missing required fields",
          });
        }

        const cart = await db.cartItem.delete({
          where: {
            id: cartId,
          },
        });

        return {
          status: 200,
          cart,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete cart: " + error,
        });
      }
    }),
  clearCart: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { userId } = input;

        if (!input.userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario não logado!",
          });
        }

        const cart = await db.cartItem.deleteMany({
          where: {
            userId,
          },
        });

        return {
          status: 200,
          cart,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear cart: " + error,
        });
      }
    }),
  getCart: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!input.userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario não logado!",
          });
        }

        const user = await db.user.findUnique({
          where: {
            id: input.userId,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const cart = await db.cartItem.findMany({
          where: {
            userId: user.id,
          },
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return cart;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve cart: " + error,
        });
      }
    }),
});
