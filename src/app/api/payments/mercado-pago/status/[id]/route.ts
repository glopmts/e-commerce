import { db } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paymentId = (await params).id;
    console.log("🔄 Verificando status do pagamento:", paymentId);

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Buscar informações do Mercado Pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    console.log("📊 Status do Mercado Pago:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
    });

    // Buscar no banco
    const dbPayment = await db.payment.findFirst({
      where: { transactionId: paymentId },
      include: {
        order: true,
      },
    });

    if (!dbPayment) {
      console.error("❌ Pagamento não encontrado no banco:", paymentId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    console.log("📊 Status no banco:", {
      paymentStatus: dbPayment.status,
      orderStatus: dbPayment.order?.status,
    });

    let status: "pending" | "approved" | "rejected" = "pending";
    let shouldUpdateOrder = false;

    // Sincronizar status se necessário
    if (paymentInfo.status === "approved" && dbPayment.status !== "COMPLETED") {
      console.log("🔄 Sincronizando: Pagamento aprovado no Mercado Pago!");

      // Atualizar pagamento
      await db.payment.update({
        where: { id: dbPayment.id },
        data: {
          status: "COMPLETED",
          metadata: paymentInfo as any,
          updatedAt: new Date(),
        },
      });

      // Atualizar pedido se existir
      if (dbPayment.order) {
        await db.order.update({
          where: { id: dbPayment.order.id },
          data: {
            status: "CONFIRMED",
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("✅ Pedido atualizado para CONFIRMED");
      }

      shouldUpdateOrder = true;
      status = "approved";
    } else if (
      (paymentInfo.status === "rejected" ||
        paymentInfo.status === "cancelled") &&
      dbPayment.status !== "FAILED" &&
      dbPayment.status !== "CANCELLED"
    ) {
      console.log("🔄 Sincronizando: Pagamento rejeitado no Mercado Pago!");

      await db.payment.update({
        where: { id: dbPayment.id },
        data: {
          status: "FAILED",
          metadata: paymentInfo as any,
          updatedAt: new Date(),
        },
      });

      if (dbPayment.order) {
        await db.order.update({
          where: { id: dbPayment.order.id },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });
      }

      status = "rejected";
    } else {
      // Manter status atual
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
    }

    // Buscar dados atualizados
    const updatedDbPayment = await db.payment.findFirst({
      where: { transactionId: paymentId },
      include: {
        order: true,
      },
    });

    const response = {
      status,
      mercadopagoStatus: paymentInfo.status,
      orderStatus: updatedDbPayment?.order?.status,
      paymentId: paymentId,
      amount: paymentInfo.transaction_amount,
      lastUpdated: new Date().toISOString(),
      synchronized: shouldUpdateOrder,
    };

    console.log("📤 Resposta do status:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Erro ao verificar status do pagamento:", error);

    // Fallback: tentar buscar apenas do banco
    try {
      const paymentId = (await params).id;
      const dbPayment = await db.payment.findFirst({
        where: { transactionId: paymentId },
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
          paymentId: paymentId,
          amount: dbPayment.amount,
          lastUpdated: dbPayment.updatedAt.toISOString(),
          fromDatabase: true,
          error: "MercadoPago API unavailable",
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