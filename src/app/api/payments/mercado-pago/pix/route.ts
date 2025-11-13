import { db } from "@/lib/prisma";
import { appRouter } from "@/server/trpc/routers/_app";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { validatePrices } from "../../../../../lib/price-validation";

export interface ItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: ItemProps[];
  item?: ItemProps;
  total: number;
  userId: string;
  email: string;
  shippingAddressId: string;
  paymentMethodId: string;
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string,
  options: { timeout: 10000 },
});

export async function POST(request: Request) {
  try {
    const {
      items,
      item,
      email,
      userId,
      total,
      shippingAddressId,
      paymentMethodId,
    }: CheckoutRequest = await request.json();

    console.log("Recebendo pedido PIX:", {
      userId,
      total,
      itemsCount: items?.length || 1,
      paymentMethodId,
    });

    const checkoutItems = items || (item ? [item] : []);
    const validationResult = await validatePrices(checkoutItems, total);

    if (
      checkoutItems.length === 0 ||
      !email ||
      !userId ||
      !total ||
      !shippingAddressId
    ) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    if (!validationResult.isValid) {
      console.error("Erros de validação de preços:", validationResult.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Erro de validação de preços",
          errors: validationResult.errors,
          details: {
            frontendTotal: total,
            calculatedTotal: validationResult.calculatedTotal,
            items: validationResult.items,
          },
        },
        { status: 400 }
      );
    }

    let finalPaymentMethodId = paymentMethodId;

    if (!finalPaymentMethodId) {
      const pixPaymentMethod = await db.paymentMethod.findFirst({
        where: {
          OR: [{ name: "PIX" }, { typePayment: "PIX" }],
          isActive: true,
        },
      });

      if (!pixPaymentMethod) {
        const newPixMethod = await db.paymentMethod.create({
          data: {
            name: "PIX",
            description: "Pagamento via PIX",
            isActive: true,
            typePayment: "PIX",
          },
        });
        finalPaymentMethodId = newPixMethod.id;
      } else {
        finalPaymentMethodId = pixPaymentMethod.id;
      }
    } else {
      const existingPaymentMethod = await db.paymentMethod.findUnique({
        where: { id: finalPaymentMethodId },
      });

      if (!existingPaymentMethod) {
        const pixPaymentMethod = await db.paymentMethod.findFirst({
          where: {
            OR: [{ name: "PIX" }, { typePayment: "PIX" }],
            isActive: true,
          },
        });
        finalPaymentMethodId = pixPaymentMethod?.id!;
      }
    }

    if (!finalPaymentMethodId) {
      return NextResponse.json(
        { error: "Método de pagamento PIX não configurado" },
        { status: 400 }
      );
    }

    const description =
      checkoutItems.length === 1
        ? checkoutItems[0].name
        : `Compra de ${checkoutItems.length} itens`;

    const payment = new Payment(client);
    const response = await payment.create({
      body: {
        transaction_amount: total, // Usar o total validado
        payment_method_id: "pix",
        description: description,
        payer: {
          email: email,
        },
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mercado-pago/webhook`,
      },
    });

    const paymentId = response?.id?.toString() ?? "";

    console.log("Criando pedido com paymentMethodId:", finalPaymentMethodId);

    await db.$transaction(async (tx) => {
      const caller = appRouter.createCaller({
        db: tx,
        user: { id: userId },
      });

      if (checkoutItems.length > 1) {
        // Para múltiplos itens
        const order = await caller.order.create({
          userId,
          shippingAddressId,
          paymentMethodId: finalPaymentMethodId,
          items: checkoutItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        });

        // Criar pagamento com orderId garantido
        await tx.payment.create({
          data: {
            amount: total,
            status: "PENDING",
            processor: "mercadopago",
            transactionId: paymentId,
            userId: userId,
            productId: checkoutItems[0].id,
            paymentMethodId: finalPaymentMethodId,
            orderId: order.id,
          },
        });
      } else {
        // Para item único
        await caller.order.createWithPayment({
          userId,
          productId: checkoutItems[0].id,
          quantity: checkoutItems[0].quantity,
          shippingAddressId,
          paymentMethodId: finalPaymentMethodId,
          paymentId,
          totalPrice: total,
        });
      }
    });

    return NextResponse.json({
      id: response.id,
      status: response.status,
      original_amount: total,
      discounted_amount: total,
      qr_code: response.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64:
        response.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error) {
    console.error("Erro no checkout PIX:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Erro no processamento do pagamento PIX",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}