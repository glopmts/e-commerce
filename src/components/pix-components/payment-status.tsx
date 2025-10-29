"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { PaymentStatusProps } from "../../types/pix-interfaces";

export function PaymentStatus({
  paymentStatus,
  paymentId,
}: PaymentStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {paymentStatus === "pending" && (
            <Clock className="h-5 w-5 text-amber-500" />
          )}
          {paymentStatus === "approved" && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {paymentStatus === "rejected" && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          {paymentStatus === "expired" && (
            <AlertCircle className="h-5 w-5 text-blue-500" />
          )}
          Status do Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {paymentStatus === "pending" && (
              <>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Aguardando pagamento PIX</span>
              </>
            )}
            {paymentStatus === "approved" && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">
                  Pagamento aprovado!
                </span>
              </>
            )}
            {paymentStatus === "rejected" && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600">
                  Pagamento rejeitado
                </span>
              </>
            )}
            {paymentStatus === "expired" && (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-600">
                  Pagamento expirado
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            O status será atualizado automaticamente após a confirmação do
            pagamento.
          </p>
          {paymentId && (
            <p className="text-xs text-muted-foreground">
              ID do Pagamento: {paymentId}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
