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
import { useCallback, useEffect, useRef, useState } from "react";
import { PixItem } from "@/types/pix-interfaces";

interface PixData {
  qrCodeBase64: string;
  qrCode: string;
  paymentId: string;
  status?: string;
  expirationDate?: string;
}

const PixCheckout = () => {
  const searchParams = useSearchParams();
  const { data: user, isLoading: isLoadingUser } =
    trpc.user.getCurrentUser.useQuery();

  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);
  const generationAttemptedRef = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "approved" | "rejected" | "expired"
  >("pending");
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [checkoutType, setCheckoutType] = useState<"single" | "cart">("single");
  const [processedItems, setProcessedItems] = useState<PixItem[]>([]);

  const { checkPaymentStatus, handleGeneratePix } = usePixPayment();

  // Processar dados uma única vez
  const processCheckoutData = useCallback((): {
    items: PixItem[];
    type: "single" | "cart";
    total: number;
    shippingAddressId: string;
    paymentMethodId: string;
  } => {
    // ... (código existente mantido)
    const itemParam = searchParams.get("product");
    const total = Number.parseFloat(
      searchParams.get("total") || searchParams.get("subtotal") || "0"
    );
    const shippingAddressId = searchParams.get("shippingAddress") || "";
    const paymentMethodId = searchParams.get("paymentMethod") || "";
    const quantity = Number.parseFloat(searchParams.get("quantity") || "1");
    const selectedItemsParam = searchParams.get("selectedItems");
    const cartDataParam = searchParams.get("cartData");

    let items: PixItem[] = [];
    let type: "single" | "cart" = "single";

    if (cartDataParam && selectedItemsParam) {
      try {
        const cartData = JSON.parse(cartDataParam);
        const selectedItems = new Set(JSON.parse(selectedItemsParam));

        items = cartData
          .filter((item: any) => selectedItems.has(item.id))
          .map((item: any) => ({
            id: item.product.id,
            name: item.product.title || item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            shippingAddressId: shippingAddressId,
            paymentMethodId: paymentMethodId,
          }));

        if (items.length > 0) {
          type = "cart";
        }
      } catch (error) {
        console.error("Erro ao processar dados do carrinho:", error);
        return {
          items: [],
          type: "single",
          total: 0,
          shippingAddressId: "",
          paymentMethodId: "",
        };
      }
    } else if (itemParam) {
      type = "single";
      items = [
        {
          id: itemParam,
          name: searchParams.get("productName") || "Produto",
          price: Number.parseFloat(searchParams.get("price") || "0"),
          quantity: quantity,
          shippingAddressId: shippingAddressId,
          paymentMethodId: paymentMethodId,
        },
      ];
    }

    return { items, type, total, shippingAddressId, paymentMethodId };
  }, [searchParams]);

  // Efeito para processar dados uma única vez
  useEffect(() => {
    const checkoutData = processCheckoutData();
    setProcessedItems(checkoutData.items);
    setCheckoutType(checkoutData.type);
  }, [processCheckoutData]);

  const generatePixPayment = useCallback(async () => {
    if (
      isGeneratingRef.current ||
      hasGeneratedRef.current ||
      generationAttemptedRef.current ||
      !user?.id ||
      processedItems.length === 0
    ) {
      console.log("Geração de PIX bloqueada - já em andamento ou concluída");
      return;
    }

    const checkoutData = processCheckoutData();

    if (checkoutData.items.length === 0) {
      setError("Nenhum item encontrado para pagamento");
      return;
    }

    generationAttemptedRef.current = true;
    isGeneratingRef.current = true;
    setIsProcessing(true);

    console.log("Iniciando geração de PIX...", {
      itemsCount: checkoutData.items.length,
      total: checkoutData.total,
    });

    try {
      await handleGeneratePix(
        checkoutData.items,
        checkoutData.total,
        user.id,
        user.email || null,
        retryCount,
        checkoutData.paymentMethodId || "pix",
        checkoutData.shippingAddressId,
        setError,
        setIsProcessing,
        setPixData,
        setExpirationTime,
        setRetryCount
      );

      hasGeneratedRef.current = true;
    } catch (error) {
      console.error("Erro ao gerar pagamento PIX:", error);
      setError("Erro ao gerar pagamento PIX");
      generationAttemptedRef.current = false;
    } finally {
      isGeneratingRef.current = false;
    }
  }, [
    user?.id,
    user?.email,
    retryCount,
    handleGeneratePix,
    processedItems.length,
    processCheckoutData,
  ]);

  useEffect(() => {
    if (
      user?.id &&
      processedItems.length > 0 &&
      !hasGeneratedRef.current &&
      !isGeneratingRef.current &&
      !generationAttemptedRef.current
    ) {
      console.log("Condições atendidas, gerando PIX...");
      generatePixPayment();
    } else {
      console.log("Condições não atendidas:", {
        hasUser: !!user?.id,
        hasItems: processedItems.length > 0,
        hasGenerated: hasGeneratedRef.current,
        isGenerating: isGeneratingRef.current,
        attempted: generationAttemptedRef.current,
      });
    }
  }, [user?.id, processedItems.length, generatePixPayment]);

  const handleRetry = useCallback(async () => {
    // CORREÇÃO: Reset completo para nova tentativa
    hasGeneratedRef.current = false;
    isGeneratingRef.current = false;
    generationAttemptedRef.current = false;
    setPixData(null);
    setError(null);
    setPaymentStatus("pending");
    setRetryCount(0);
    await generatePixPayment();
  }, [generatePixPayment]);

  // Timer para expiração
  useEffect(() => {
    if (!expirationTime || paymentStatus !== "pending") return;

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
  }, [expirationTime, paymentStatus]);

  // Verificar status do pagamento
  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus !== "pending") return;

    const interval = setInterval(() => {
      checkPaymentStatus(pixData.paymentId, paymentStatus, setPaymentStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, [pixData?.paymentId, paymentStatus, checkPaymentStatus]);

  if (isLoadingUser) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const checkoutData = processCheckoutData();

  return (
    <div className="w-full min-h-screen h-full p-2 max-w-7xl mx-auto">
      <div className="w-full h-full">
        <div className="pb-6">
          <h1 className="text-2xl font-semibold">Pagamento via PIX</h1>
          {checkoutType === "cart" && (
            <p className="text-sm text-muted-foreground mt-1">
              Pagamento do carrinho com {checkoutData.items.length} item(s)
            </p>
          )}
          {checkoutType === "single" && (
            <p className="text-sm text-muted-foreground mt-1">
              Pagamento de item único
            </p>
          )}
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
            <OrderSummary
              items={checkoutData.items}
              subtotal={checkoutData.total}
              total={checkoutData.total}
              type={checkoutType}
            />
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
