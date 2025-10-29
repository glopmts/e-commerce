"use client";

import { PaymentStatusIndicatorProps } from "@/types/pix-interfaces";
import { CheckCircle, Clock } from "lucide-react";

export function PaymentStatusIndicator({
  paymentStatus,
  timeLeft,
}: PaymentStatusIndicatorProps) {
  const minutes = timeLeft ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft ? timeLeft % 60 : 0;

  if (paymentStatus === "pending") {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
        <Clock className="h-4 w-4" />
        <div className="flex flex-col gap-2">
          <span>Aguardando pagamento... Verificando automaticamente</span>
          {timeLeft !== undefined && (
            <p>
              Tempo restante: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (paymentStatus === "approved") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
        <CheckCircle className="h-4 w-4" />
        <span>Pagamento aprovado! Redirecionando...</span>
      </div>
    );
  }

  return null;
}
