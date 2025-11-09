import { transporter } from "@/lib/email";
import { db } from "@/lib/prisma";
import { generatePurchaseConfirmationEmail } from "@/lib/send-email";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔔 Webhook recebido:", JSON.stringify(body, null, 2));

    // Verificar se é um webhook de pagamento
    if (body.type !== "payment") {
      return NextResponse.json({ success: true });
    }

    if (!body.data || !body.data.id) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const paymentId = body.data.id;
    console.log("💰 Processando pagamento:", paymentId);

    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    const dbPayment = await db.payment.findFirst({
      where: {
        transactionId: paymentId.toString(),
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        Product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        order: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!dbPayment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Mapear status
    let paymentStatus:
      | "PENDING"
      | "COMPLETED"
      | "FAILED"
      | "PROCESSING"
      | "REFUNDED"
      | "CANCELLED";

    switch (paymentInfo.status) {
      case "approved":
        paymentStatus = "COMPLETED";
        break;
      case "rejected":
      case "cancelled":
        paymentStatus = "FAILED";
        break;
      case "in_process":
      case "pending":
        paymentStatus = "PENDING";
        break;
      case "refunded":
        paymentStatus = "REFUNDED";
        break;
      default:
        paymentStatus = "PENDING";
    }

    // Atualizar pagamento
    const updatedPayment = await db.payment.update({
      where: {
        id: dbPayment.id,
      },
      data: {
        status: paymentStatus,
        metadata: paymentInfo as any,
        updatedAt: new Date(),
      },
    });

    // Se o pagamento foi aprovado, atualizar o pedido
    if (paymentInfo.status === "approved") {
      if (dbPayment.order) {
        const updatedOrder = await db.order.update({
          where: { id: dbPayment.order.id },
          data: {
            status: "CONFIRMED",
            paidAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });

        // Enviar email de confirmação
        if (dbPayment.User?.email) {
          try {
            const emailOptions = generatePurchaseConfirmationEmail({
              email: dbPayment.User.email,
              name: dbPayment.User.name || "Cliente",
              orderId: updatedOrder.orderNumber,
              purchaseDate: new Date().toLocaleDateString("pt-BR"),
              items: updatedOrder.orderItems.map((item) => ({
                name: item.product.title,
                quantity: item.quantity,
                price: item.unitPrice,
              })),
              totalAmount: updatedOrder.finalAmount,
            });

            await transporter.sendMail(emailOptions);
            console.log("📧 Email enviado para:", dbPayment.User.email);
          } catch (emailError) {
            console.error("❌ Erro ao enviar email:", emailError);
          }
        }
      } else {
        console.log("⚠️ Pagamento não vinculado a um pedido");
      }
    }

    // Se o pagamento foi rejeitado
    if (
      paymentInfo.status === "rejected" ||
      paymentInfo.status === "cancelled"
    ) {
      if (dbPayment.order) {
        await db.order.update({
          where: { id: dbPayment.order.id },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      status: paymentInfo.status,
      orderUpdated: paymentInfo.status === "approved",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");

  if (paymentId) {
    try {
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      return NextResponse.json({
        payment_status: paymentInfo.status,
        webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mercado-pago/webhook`,
        registered: true,
      });
    } catch (error) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
  }

  return NextResponse.json({
    webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mercado-pago/webhook`,
    environment: process.env.NODE_ENV,
  });
}
