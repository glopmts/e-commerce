import { db } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string,
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paymentId = (await params).id;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    const dbPayment = await db.payment.findFirst({
      where: { transactionId: paymentId },
      include: {
        order: true,
      },
    });

    let status: "pending" | "approved" | "rejected" = "pending";

    switch (paymentInfo.status) {
      case "approved":
        status = "approved";
        break;
      case "rejected":
      case "cancelled":
        status = "rejected";
        break;
      default:
        status = "pending";
    }

    return NextResponse.json({
      status,
      mercadopagoStatus: paymentInfo.status,
      orderStatus: dbPayment?.order?.status,
      paymentId: paymentId,
      amount: paymentInfo.transaction_amount,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);

    try {
      const dbPayment = await db.payment.findFirst({
        where: { transactionId: (await params).id },
        include: {
          order: true,
        },
      });

      if (dbPayment) {
        let status: "pending" | "approved" | "rejected" = "pending";

        switch (dbPayment.status) {
          case "COMPLETED":
            status = "approved";
            break;
          case "FAILED":
          case "CANCELLED":
            status = "rejected";
            break;
          default:
            status = "pending";
        }

        return NextResponse.json({
          status,
          mercadopagoStatus: "unknown",
          orderStatus: dbPayment.order?.status,
          paymentId: (await params).id,
          amount: dbPayment.amount,
          lastUpdated: dbPayment.updatedAt.toISOString(),
          fromDatabase: true,
        });
      }
    } catch (dbError) {
      console.error("Erro ao buscar no banco:", dbError);
    }

    return NextResponse.json(
      { error: "Erro ao verificar status do pagamento" },
      { status: 500 }
    );
  }
}
