import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "../../../lib/prisma";
import { protectedProcedure, router } from "../init";

export const orderRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        shippingAddressId: z.string(),
        billingAddressId: z.string(),
        paymentMethodId: z.string(),
        discountCode: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      let totalAmount = 0;
      const orderItems = [];

      for (const item of input.items) {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: {
              where: { id: item.variantId || undefined },
            },
          },
        });

        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        const variant = item.variantId ? product.variants[0] : null;

        const price = variant?.price || product.price;
        const stock = variant?.stock || product.stock;

        if (stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.title}`);
        }

        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: price,
          totalPrice: itemTotal,
        });
      }

      let discountAmount = 0;
      let discountId = undefined;

      if (input.discountCode) {
        const discount = await db.discount.findFirst({
          where: {
            code: input.discountCode,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        });

        if (discount) {
          if (discount.type === "PERCENTAGE") {
            discountAmount = totalAmount * (discount.value / 100);
            if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
              discountAmount = discount.maxDiscount;
            }
          } else {
            discountAmount = discount.value;
          }
          discountId = discount.id;
        }
      }

      const finalAmount = totalAmount - discountAmount;

      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const order = await db.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          totalAmount,
          discountAmount,
          finalAmount,
          userId: session?.user.id!,
          shippingAddressId: input.shippingAddressId,
          billingAddressId: input.billingAddressId,
          paymentMethodId: input.paymentMethodId,
          discountId,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
              variant: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          paymentMethod: true,
        },
      });

      for (const item of input.items) {
        if (item.variantId) {
          await db.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        } else {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      return order;
    }),

  // Listar pedidos do usuário
  getUserOrders: protectedProcedure.query(async ({ ctx }) => {
    const { session } = ctx;

    const orders = await db.order.findMany({
      where: {
        userId: session?.user.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: {
              include: {
                size: true,
                color: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  }),

  // Buscar pedido específico
  getOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      const order = await db.order.findFirst({
        where: {
          id: input.id,
          userId: session?.user.id,
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              variant: {
                include: {
                  size: true,
                  color: true,
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
          paymentMethod: true,
          discount: true,
          payments: true,
        },
      });

      if (!order) {
        throw new Error("Pedido não encontrado");
      }

      return order;
    }),

  // Atualizar status do pedido (apenas admin)
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await db.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
          ...(input.status === "SHIPPED" && { shippedAt: new Date() }),
          ...(input.status === "DELIVERED" && { deliveredAt: new Date() }),
        },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    }),
});
