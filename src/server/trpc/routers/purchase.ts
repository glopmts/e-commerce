import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "../../../lib/prisma";
import { protectedProcedure, router } from "../init";

export const orderRouter = router({
create: protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      shippingAddressId: z.string(),
      billingAddressId: z.string().optional(),
      paymentMethodId: z.string(),
      discountCode: z.string().optional(),
      items: z.array(
        z.object({
          productId: z.string(),
          variantId: z.string().optional(),
          quantity: z.number().min(1),
          unitPrice: z.number().optional(), // Adicionar preço unitário
        })
      ),
    })
  )
  .mutation(async ({ ctx, input }) => {
    let totalAmount = 0;
    const orderItems = [];

    // Buscar informações de pagamento para verificar se é PIX
    const paymentMethod = await db.paymentMethod.findUnique({
      where: { id: input.paymentMethodId },
    });

    const isPixPayment = paymentMethod?.typePayment === "PIX";

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
      
      // SEMPRE usar o preço do banco de dados, não aceitar do frontend
      const originalPrice = variant?.price || product.price;
      const stock = variant?.stock || product.stock;

      if (stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.title}`);
      }

      // Aplicar desconto de 10% apenas para PIX
      let finalUnitPrice = originalPrice;
      if (isPixPayment) {
        finalUnitPrice = originalPrice * 0.9; // 10% de desconto
      }

      const itemTotal = finalUnitPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: originalPrice, // Salvar preço original
        finalUnitPrice: finalUnitPrice, // Salvar preço final com desconto
        totalPrice: itemTotal,
        discountApplied: isPixPayment ? 0.1 : 0, // Registrar desconto aplicado
      });
    }

    let discountAmount = 0;
    let discountId = undefined;

    // Desconto adicional por código (se aplicável)
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
        shippingAmount: 0,
        finalAmount,
        userId: input.userId!,
        shippingAddressId: input.shippingAddressId,
        billingAddressId: input.billingAddressId || input.shippingAddressId,
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

    // Atualizar estoque
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
  createWithPayment: protectedProcedure
  .input(
    z.object({
      productId: z.string(),
      userId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().min(1),
      shippingAddressId: z.string(),
      paymentMethodId: z.string(),
      paymentId: z.string(),
      // Remover totalPrice do input - deve ser calculado no backend
    })
  )
  .mutation(async ({ ctx, input }) => {
    const product = await db.product.findUnique({
      where: { id: input.productId },
      include: {
        variants: {
          where: { id: input.variantId || undefined },
        },
      },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    const variant = input.variantId ? product.variants[0] : null;
    const stock = variant?.stock || product.stock;

    if (stock < input.quantity) {
      throw new Error("Estoque insuficiente");
    }

    const paymentMethod = await db.paymentMethod.findUnique({
      where: { id: input.paymentMethodId },
    });

    const isPixPayment = paymentMethod?.typePayment === "PIX";

    const originalPrice = variant?.price || product.price;
    let finalUnitPrice = originalPrice;
    
    if (isPixPayment) {
      finalUnitPrice = originalPrice * 0.9; // 10% de desconto PIX
    }

    const totalAmount = finalUnitPrice * input.quantity;

    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        totalAmount: originalPrice * input.quantity, 
        discountAmount: isPixPayment ? originalPrice * input.quantity * 0.1 : 0, 
        shippingAmount: 0,
        finalAmount: totalAmount, 
        userId: input.userId!,
        shippingAddressId: input.shippingAddressId,
        billingAddressId: input.shippingAddressId,
        paymentMethodId: input.paymentMethodId,
        orderItems: {
          create: {
            productId: input.productId,
            variantId: input.variantId,
            quantity: input.quantity,
            unitPrice: originalPrice, 
            finalUnitPrice: finalUnitPrice, 
            totalPrice: totalAmount,
          },
        },
        payments: {
          create: {
            amount: totalAmount,
            status: "PENDING",
            processor: "mercadopago",
            transactionId: input.paymentId,
            userId: input.userId,
            productId: input.productId,
            paymentMethodId: input.paymentMethodId,
          },
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
      },
    });

    // Atualizar estoque
    if (input.variantId) {
      await db.productVariant.update({
        where: { id: input.variantId },
        data: {
          stock: { decrement: input.quantity },
        },
      });
    } else {
      await db.product.update({
        where: { id: input.productId },
        data: {
          stock: { decrement: input.quantity },
        },
      });
    }

    return order;
  }),

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
