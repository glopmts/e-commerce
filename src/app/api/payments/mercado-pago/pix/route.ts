import { db } from "@/lib/prisma";
import { appRouter } from "@/server/trpc/routers/_app";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

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

    const checkoutItems = items || (item ? [item] : []);

    if (
      checkoutItems.length === 0 ||
      !email ||
      !userId ||
      !total ||
      !shippingAddressId ||
      !paymentMethodId
    ) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Validar produtos
    const productIds = checkoutItems.map((item) => item.id);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const item of checkoutItems) {
      const dbProduct = dbProducts.find((p) => p.id === item.id);

      if (!dbProduct) {
        return NextResponse.json(
          { success: false, message: `Produto ${item.id} não encontrado` },
          { status: 400 }
        );
      }

      if (item.price !== dbProduct.price) {
        return NextResponse.json(
          {
            success: false,
            message: `Preço do produto ${item.id} não corresponde ao valor no sistema`,
          },
          { status: 400 }
        );
      }

      if (dbProduct.stock && dbProduct.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Estoque insuficiente para o produto ${dbProduct.title}`,
          },
          { status: 400 }
        );
      }
    }

    const description =
      checkoutItems.length === 1
        ? checkoutItems[0].name
        : `Compra de ${checkoutItems.length} itens`;

    const payment = new Payment(client);
    const response = await payment.create({
      body: {
        transaction_amount: total,
        payment_method_id: "pix",
        description: description,
        payer: {
          email: email,
        },
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mercado-pago/webhook`,
      },
    });

    const paymentId = response?.id?.toString() ?? "";

    await db.$transaction(async (tx) => {
      const caller = appRouter.createCaller({
        db: tx,
        session: {
          user: { id: userId },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Para múltiplos itens
      if (checkoutItems.length > 1) {
        // Criar o pedido primeiro
        const order = await caller.order.create({
          shippingAddressId,
          paymentMethodId,
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
            paymentMethodId: paymentMethodId,
            orderId: order.id,
          },
        });
      } else {
        // Para item único, use createWithPayment
        await caller.order.createWithPayment({
          productId: checkoutItems[0].id,
          quantity: checkoutItems[0].quantity,
          shippingAddressId,
          paymentMethodId,
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
    console.error("Erro no checkout:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Erro no processamento do pagamento",
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
