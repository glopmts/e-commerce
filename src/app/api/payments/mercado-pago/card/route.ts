import { db } from "@/lib/prisma";
import { appRouter } from "@/server/trpc/routers/_app";
import MercadoPagoConfig, { Payment, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { CheckoutRequest } from "../pix/route";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

export async function POST(request: NextRequest) {
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

    // Criar pagamento com cartão
    const payment = new Payment(client);
    const response = await payment.create({
      body: {
        transaction_amount: total,
        payment_method_id: "credit_card",
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
          userId,
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
          userId,
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
      success: true,
      id: response.id,
      status: response.status,
      original_amount: total,
      discounted_amount: total,
      ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error: any) {
    console.error("Erro no pagamento:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        status: error.status || 500,
      },
      { status: 500 }
    );
  }
}

// Criar preferência para obter o card token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const items = searchParams.get("items");
    const shippingAddressId = searchParams.get("shippingAddressId");

    if (!items) {
      return NextResponse.json(
        { error: "Items são obrigatórios" },
        { status: 400 }
      );
    }

    const parsedItems = JSON.parse(items);

    const preference = new Preference(client);

    const preferenceData = {
      body: {
        items: parsedItems.map((item: any) => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "BRL",
          description: item.description || "",
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
          installments: 12,
        },
        metadata: {
          shipping_address_id: shippingAddressId,
        },
      },
    };

    const result = await preference.create(preferenceData);

    return NextResponse.json({
      preference_id: result.id,
      init_point: result.init_point,
    });
  } catch (error: any) {
    console.error("Erro ao criar preferência:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
