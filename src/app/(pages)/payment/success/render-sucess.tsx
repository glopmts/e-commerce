"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SuccessPage = () => {
  const searchParams = useSearchParams();

  // Obter dados dos query parameters
  const orderNumber = searchParams.get("order") || "#ORD-2024-001";
  const totalPaid = searchParams.get("total") || "0";
  const paymentId = searchParams.get("paymentId") || "";

  // Formatar o valor para exibição
  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
          Pagamento Confirmado!
        </h1>

        <p className="text-muted-foreground text-lg mb-2">
          Sua transação foi processada com sucesso.
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          Você receberá um email de confirmação com os detalhes do seu pedido em
          breve.
        </p>

        <div className="bg-muted rounded-lg p-4 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Número do pedido
            </span>
            <span className="font-mono font-semibold text-foreground">
              {orderNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total pago</span>
            <span className="font-semibold text-lg text-foreground">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          {paymentId && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                ID do pagamento
              </span>
              <span className="font-mono text-xs text-foreground">
                {paymentId.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full bg-transparent"
          >
            <Link href="/user/purchase">
              Ver meus pedidos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SuccessPage;