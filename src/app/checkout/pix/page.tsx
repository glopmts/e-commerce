"use client";

import { ActionButtons } from "@/components/pix-components/action-buttons";
import { ErrorState } from "@/components/pix-components/error-state";
import { OrderSummary } from "@/components/pix-components/order-summary";
import { PaymentInstructions } from "@/components/pix-components/payment-instructions";
import { PaymentStatus } from "@/components/pix-components/payment-status";
import { PaymentStatusIndicator } from "@/components/pix-components/payment-status-indicator";
import { QRCodeSection } from "@/components/pix-components/qr-code-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/server/trpc/client";
import { usePixPayment } from "@/services/use-pix-payment.service";
import { Loader, QrCode } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PixData {
  qrCodeBase64: string;
  qrCode: string;
  paymentId: string;
  status?: string;
  expirationDate?: string;
}

type Item = {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    stock: number | null;
  };
};

type RawItem = {
  id: string;
  title?: string;
  price?: number;
  stock?: number | null;
  product?: {
    id: string;
    title: string;
    price: number;
    stock: number | null;
  };
};

const PixCheckout = () => {
  const searchParams = useSearchParams();
  const { data: user, isLoading } = trpc.user.getCurrentUser.useQuery();

  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "approved" | "rejected" | "expired"
  >("pending");
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const itemParam = searchParams.get("product");
  const total = Number.parseFloat(searchParams.get("subtotal") || "0");
  const shippingAddressId = searchParams.get("shippingAddress") || "";
  const paymentMethodId = searchParams.get("paymentMethod") || "";
  const quantity = Number.parseFloat(searchParams.get("quantity") || "1");

  const normalizeItem = (rawItem: RawItem): Item => {
    if (rawItem.product) {
      return {
        id: rawItem.id,
        product: {
          id: rawItem.product.id,
          title: rawItem.product.title,
          price: rawItem.product.price,
          stock: rawItem.product.stock,
        },
      };
    } else {
      return {
        id: rawItem.id,
        product: {
          id: rawItem.id,
          title: rawItem.title ?? "",
          price: rawItem.price ?? 0,
          stock: rawItem.stock ?? null,
        },
      };
    }
  };

  const item = useMemo(() => {
    return itemParam ? normalizeItem(JSON.parse(itemParam)) : null;
  }, [itemParam]);

  const { checkPaymentStatus, handleGenerateSinglePix } = usePixPayment();

  const generatePixPayment = useCallback(async () => {
    if (
      isGeneratingRef.current ||
      hasGeneratedRef.current ||
      !user?.id ||
      !item
    ) {
      return;
    }

    isGeneratingRef.current = true;
    setIsProcessing(true);

    try {
      await handleGenerateSinglePix(
        {
          id: item.product.id,
          name: item.product.title,
          price: item.product.price,
          quantity: quantity,
          shippingAddressId: shippingAddressId,
          paymentMethodId: paymentMethodId,
        },
        total,
        user.id,
        user.email || null,
        retryCount,
        setError,
        setIsProcessing,
        setPixData,
        setExpirationTime,
        setRetryCount
      );

      hasGeneratedRef.current = true;
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      setError("Erro ao gerar pagamento PIX");
    } finally {
      isGeneratingRef.current = false;
    }
  }, [
    user?.id,
    user?.email,
    item,
    handleGenerateSinglePix,
    quantity,
    total,
    shippingAddressId,
    paymentMethodId,
    retryCount,
  ]);

  const handleRetry = useCallback(async () => {
    hasGeneratedRef.current = false;
    isGeneratingRef.current = false;
    setPixData(null);
    setError(null);
    setPaymentStatus("pending");
    await generatePixPayment();
  }, [generatePixPayment]);

  useEffect(() => {
    if (
      user?.id &&
      item &&
      !hasGeneratedRef.current &&
      !isGeneratingRef.current
    ) {
      console.log("Executando geração automática do PIX...");
      generatePixPayment();
    }
  }, [user?.id, item, generatePixPayment]);

  // Timer para expiração
  useEffect(() => {
    if (!expirationTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = expirationTime.getTime() - now.getTime();
      const secondsLeft = Math.max(0, Math.floor(diff / 1000));

      setTimeLeft(secondsLeft);

      if (secondsLeft === 0) {
        setPaymentStatus("expired");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expirationTime]);

  // Verificar status do pagamento
  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus !== "pending") return;

    const interval = setInterval(() => {
      checkPaymentStatus(pixData.paymentId, paymentStatus, setPaymentStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, [pixData?.paymentId, paymentStatus, checkPaymentStatus]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen h-full p-2 max-w-7xl mx-auto">
      <div className="w-full h-full">
        <div className="pb-6">
          <h1 className="text-2xl font-semibold">Pagamento via PIX</h1>
        </div>
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
                    onRetry={handleRetry}
                    isProcessing={isProcessing}
                    retryCount={retryCount}
                  />
                ) : !pixData ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-gray-600">Gerando QR Code PIX...</p>
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
            <OrderSummary item={item} subtotal={total} total={total} />
            <PaymentStatus
              paymentStatus={paymentStatus}
              paymentId={pixData?.paymentId}
            />
            <ActionButtons
              error={error}
              onRetry={handleRetry}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixCheckout;
