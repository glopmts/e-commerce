"use client";

import { Loader, QrCode } from "lucide-react";
import { OrderSummaryProps } from "../../types/pix-interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ActionButtons } from "./action-buttons";
import { ErrorState } from "./error-state";
import { OrderSummary } from "./order-summary";
import { PaymentInstructions } from "./payment-instructions";
import { PaymentStatus } from "./payment-status";
import { PaymentStatusIndicator } from "./payment-status-indicator";
import { QRCodeSection } from "./qr-code-section";

interface PropsPix extends OrderSummaryProps {
  error: string;
  paymentId?: string;
  onRetry: () => void;
  isProcessing: boolean;
  retryCount: number;
  pixData: {
    qrCodeBase64: string;
    qrCode: string;
  } | null;
  timeLeft: number;
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
}

const PixInforDate = ({
  error,
  isProcessing,
  onRetry,
  paymentStatus,
  pixData,
  retryCount,
  timeLeft,
  item,
  items,
  subtotal,
  total,
  paymentId,
}: PropsPix) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Coluna do QR Code */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <ErrorState
                error={error}
                onRetry={onRetry}
                isProcessing={isProcessing}
                retryCount={retryCount}
              />
            ) : !pixData ? (
              <div className="">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <QRCodeSection
                  pixData={pixData}
                  paymentStatus={paymentStatus}
                  timeLeft={timeLeft}
                />
                <PaymentStatusIndicator
                  paymentStatus={paymentStatus}
                  timeLeft={timeLeft}
                />
              </div>
            )}
          </CardContent>
        </Card>
        <PaymentInstructions />
      </div>

      {/* Coluna do Resumo */}
      <div className="space-y-6">
        <OrderSummary
          item={item}
          items={items}
          subtotal={total}
          total={total}
        />
        <PaymentStatus paymentStatus={paymentStatus} paymentId={paymentId} />
        <ActionButtons
          error={error}
          onRetry={onRetry}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default PixInforDate;
