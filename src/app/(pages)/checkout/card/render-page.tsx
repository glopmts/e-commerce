"use client";

import { CardForm } from "@/components/card-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useMercadoPagoCard } from "@/hooks/useMercadoPagoCard";
import { trpc } from "@/server/trpc/client";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CardPaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } =
    trpc.user.getCurrentUser.useQuery();
  const { data: savedCards } = trpc.card.getUserCards.useQuery();
  const saveCardMutation = trpc.card.saveCard.useMutation();
  const {
    createCardToken,
    processCardPayment,
    loading: isProcessingPayment,
  } = useMercadoPagoCard();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const itemParam = searchParams.get("product") || "Produto";
  const total = Number.parseFloat(searchParams.get("subtotal") || "0");
  const shippingAddressId = searchParams.get("shippingAddress") || "";
  const paymentMethodId = searchParams.get("paymentMethod") || "";
  const quantity = Number.parseInt(searchParams.get("quantity") || "1");
  const productId = searchParams.get("productId") || "";

  const handleSaveCard = async (cardData: {
    cardNumber: string;
    holderName: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    brand: string;
  }) => {
    try {
      const token = await createCardToken({
        cardNumber: cardData.cardNumber,
        cardholderName: cardData.holderName,
        cardExpirationMonth: cardData.expiryMonth.toString().padStart(2, "0"),
        cardExpirationYear: cardData.expiryYear.toString(),
        securityCode: cardData.cvv,
        identificationType: "CPF",
        identificationNumber: "00000000000",
      });

      await saveCardMutation.mutateAsync({
        ...cardData,
        token: token.id,
        isDefault: !savedCards || savedCards.length === 0,
      });

      setShowNewCardForm(false);
    } catch (error: any) {
      console.error("Error saving card:", error);
      setPaymentError(error.message || "Erro ao salvar cartão");
    }
  };

  const handlePayment = async () => {
    if (!selectedCardId && !showNewCardForm) {
      setPaymentError("Selecione um cartão ou adicione um novo");
      return;
    }

    setPaymentStatus("processing");
    setPaymentError(null);

    try {
      const cardDetails = await trpc.card.getCardForPayment.useQuery({
        cardId: selectedCardId!,
      });

      if (!cardDetails) {
        throw new Error("Cartão não encontrado");
      }

      const result = await processCardPayment({
        token: cardDetails.data?.token || "",
        amount: total,
        description: itemParam,
        email: user?.email || "",
        installments: 1,
      });

      if (result.success) {
        setPaymentStatus("success");
        setTimeout(() => {
          router.push(`/payment/success?orderId=${result.orderId}`);
        }, 2000);
      } else {
        throw new Error(result.error || "Pagamento falhou");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setPaymentError(error.message || "Erro ao processar pagamento");
    }
  };

  if (isLoadingUser) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center">
            Você precisa estar logado para realizar o pagamento.
          </p>
          <Button className="mt-4 w-full" onClick={() => router.push("/login")}>
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 mx-auto max-w-6xl">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Pagamento com Cartão</h1>
            <p className="text-muted-foreground mt-2">
              Complete os dados do seu cartão para finalizar a compra
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total a pagar:</span>
                <span className="text-2xl font-bold">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              {quantity > 1 && (
                <p className="text-sm text-muted-foreground">
                  {quantity}x {itemParam}
                </p>
              )}
            </div>
          </Card>

          {/* Payment Status */}
          {paymentStatus === "success" && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Pagamento aprovado!
                  </h3>
                  <p className="text-sm text-green-700">
                    Redirecionando para confirmação...
                  </p>
                </div>
              </div>
            </Card>
          )}

          {paymentStatus === "error" && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Erro no pagamento
                  </h3>
                  <p className="text-sm text-red-700">
                    {paymentError || "Tente novamente"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Card Selection/Form */}
        <div className="space-y-6">
          {/* Saved Cards */}
          {savedCards && savedCards.length > 0 && !showNewCardForm && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Cartões Salvos</h2>
              {savedCards.map((card) => (
                <Card
                  key={card.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedCardId === card.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <div className="font-medium">
                          •••• {card.lastFourDigits}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {card.holderName}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {card.expiryMonth.toString().padStart(2, "0")}/
                      {card.expiryYear.toString().slice(-2)}
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setShowNewCardForm(true)}
              >
                Adicionar Novo Cartão
              </Button>
            </div>
          )}

          {/* New Card Form */}
          {(showNewCardForm || !savedCards || savedCards.length === 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {savedCards && savedCards.length > 0
                    ? "Novo Cartão"
                    : "Adicionar Cartão"}
                </h2>
                {savedCards && savedCards.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCardForm(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
              <CardForm
                onSubmit={handleSaveCard}
                loading={saveCardMutation.isPending}
              />
            </div>
          )}

          {/* Payment Button */}
          {selectedCardId && !showNewCardForm && (
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessingPayment || paymentStatus === "processing"}
            >
              {isProcessingPayment || paymentStatus === "processing"
                ? "Processando..."
                : `Pagar R$ ${total.toFixed(2)}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPaymentPage;
