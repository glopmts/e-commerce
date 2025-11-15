"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Title from "@/components/TitleComponent";
import Link from "next/link";
import { useState } from "react";
import { CreditCard, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartSummaryProps {
  totalItems: number;
  cartTotal: number;
  selectedItems: Set<string>;
  shippingAddressId: string;
  cartData?: Array<{
    id: string;
    quantity: number;
    product: { price: number };
  }>;
}

export function CartSummary({
  totalItems,
  cartTotal,
  selectedItems,
  cartData,
  shippingAddressId,
}: CartSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const router = useRouter();

  // Calcular total dos itens selecionados
  const selectedTotal =
    selectedItems.size > 0 && cartData
      ? cartData
          .filter((item) => selectedItems.has(item.id))
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      : cartTotal;

  const selectedCount =
    selectedItems.size > 0
      ? cartData
          ?.filter((item) => selectedItems.has(item.id))
          .reduce((sum, item) => sum + item.quantity, 0) || 0
      : totalItems;

  // Desconto de 10% para PIX = use dados reais do banco de dados, valide tanto front quanto no server!

  const pixDiscount = paymentMethod === "pix" ? selectedTotal * 0.1 : 0;
  const finalTotal = selectedTotal - pixDiscount;

  const handleCheckout = () => {
    try {
      if (paymentMethod === "pix") {
        if (!shippingAddressId) {
          toast.error("Selecione um endereço de entrega primeiro");
          return;
        }

        if (selectedItems.size > 0 && cartData) {
          const selectedCartData = cartData.filter((item) =>
            selectedItems.has(item.id)
          );

          const queryParams = new URLSearchParams({
            total: finalTotal.toString(),
            selectedItems: JSON.stringify(Array.from(selectedItems)),
            cartData: JSON.stringify(selectedCartData),
            discount: pixDiscount.toString(),
            shippingAddress: shippingAddressId,
          });

          router.push(`/checkout/pix?${queryParams.toString()}`);
        }
        // Para item único (se implementado)
        else {
          // Aqui você pode adicionar lógica para item único se necessário
          router.push(`#`);
        }
      } else {
        router.push(`#`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar pagina pagamento!" + error);
    }
  };

  return (
    <div className="md:w-80 lg:w-96 h-fit sticky top-4">
      <Card>
        <CardContent className="p-4">
          <div className="pb-3">
            <Title level={6}>Resumo da compra</Title>
          </div>

          <div className="space-y-3">
            {/* Método de pagamento */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Método de pagamento</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "card" | "pix")
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="card" id="card" />
                  <Label
                    htmlFor="card"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <CreditCard size={18} />
                    <span>Cartão de crédito</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label
                    htmlFor="pix"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <QrCode size={18} />
                    <span>PIX</span>
                    <span className="ml-auto text-xs text-green-600 font-semibold">
                      -10%
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Resumo de valores */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Itens ({selectedCount})
                  {selectedItems.size > 0 && (
                    <span className="text-muted-foreground ml-1">
                      (selecionados)
                    </span>
                  )}
                </span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedTotal)}
                </span>
              </div>

              {paymentMethod === "pix" && pixDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto PIX (10%)</span>
                  <span>
                    -{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(pixDiscount)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(finalTotal)}
              </span>
            </div>

            {paymentMethod === "pix" && (
              <p className="text-xs text-muted-foreground text-center">
                Você economiza{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(pixDiscount)}{" "}
                pagando com PIX!
              </p>
            )}

            <Button
              className="w-full mt-4 cursor-pointer rounded-full"
              size="lg"
              onClick={handleCheckout}
            >
              Finalizar Compra
            </Button>

            <Link href="/products" className="block">
              <Button
                variant="outline"
                className="w-full cursor-pointer rounded-full bg-transparent"
              >
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
