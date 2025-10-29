"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Como pagar com PIX</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Abra o aplicativo do seu banco</li>
          <li>Selecione a opção PIX</li>
          <li>Escaneie o QR Code ou cole o código PIX</li>
          <li>Confira os dados e confirme o pagamento</li>
          <li>Aguarde a confirmação automática</li>
        </ol>
      </CardContent>
    </Card>
  );
}
