// app/api/payments/mercado-pago/webhook/route.ts
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
    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    if (body.type !== "payment") {
      return NextResponse.json(
        { error: "Tipo de webhook não suportado" },
        { status: 400 }
      );
    }

    if (!body.data || !body.data.id) {
      return NextResponse.json(
        { error: "Payload do webhook inválido" },
        { status: 400 }
      );
    }

    const paymentId = body.data.id;

    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    console.log("Informações do pagamento:", {
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      transaction_amount: paymentInfo.transaction_amount,
    });

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
      console.error("Pagamento não encontrado no banco:", paymentId);
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

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

    const updatedPayment = await db.payment.update({
      where: {
        id: dbPayment.id,
      },
      data: {
        status: paymentStatus,
        metadata: paymentInfo as any,
        updatedAt: new Date(),
      },
      include: {
        User: true,
        Product: true,
        order: true,
      },
    });

    console.log("Pagamento atualizado:", {
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
    });

    if (paymentInfo.status === "approved") {
      if (dbPayment.order) {
        await db.order.update({
          where: { id: dbPayment.order.id },
          data: {
            status: "CONFIRMED",
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log("Pedido atualizado para CONFIRMED:", dbPayment.order.id);
      }

      // Enviar email de confirmação
      if (dbPayment.User?.email) {
        try {
          const orderItems = dbPayment.order?.orderItems || [
            {
              product: {
                title: dbPayment.Product?.title || "Produto",
                price: dbPayment.amount,
              },
              quantity: 1,
              unitPrice: dbPayment.amount,
            },
          ];

          const emailOptions = generatePurchaseConfirmationEmail({
            email: dbPayment.User.email,
            name: dbPayment.User.name || "Cliente",
            orderId: dbPayment.order?.orderNumber || `PAY-${dbPayment.id}`,
            purchaseDate: new Date().toLocaleDateString("pt-BR"),
            items: orderItems.map((item) => ({
              name: item.product.title,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
            totalAmount: dbPayment.amount,
          });

          await transporter.sendMail(emailOptions);
          console.log(
            "Email de confirmação enviado para:",
            dbPayment.User.email
          );
        } catch (emailError) {
          console.error("Erro ao enviar email de confirmação:", emailError);
        }
      }
    }

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
        console.log("Pedido atualizado para CANCELLED:", dbPayment.order.id);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      status: paymentInfo.status,
    });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
