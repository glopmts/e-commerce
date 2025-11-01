"use client";

import AddressInforCheckout from "@/components/checkout/address-infor";
import PaymentMethodCheckout from "@/components/checkout/payment-method";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/server/trpc/client";
import { Address, PaymentMethod } from "@/types/interfaces";
import { PaymentMethodEnum } from "@prisma/client";
import { MapPin, Plus } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const CheckoutUniqProduct = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: user } = trpc.user.getCurrentUser.useQuery();
  const userId = user?.id as string;

  const { data: product, isLoading: productLoading } =
    trpc.product.getProductById.useQuery({
      id: id as string,
    });

  const { data: addresses = [], isLoading: addressesLoading } =
    trpc.address.getAddresses.useQuery({
      userId,
    });

  const { data: paymentMethods = [] } = trpc.paymentMethod.getActive.useQuery();

  // Estados
  const [shippingAddressId, setShippingAddressId] = useState<string>(() => {
    // Define o endereço padrão automaticamente
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    return defaultAddress?.id || addresses[0]?.id || "";
  });
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<
    PaymentMethodEnum | ""
  >("");

  const getPaymentMethodIcon = (type: PaymentMethodEnum): string => {
    const icons = {
      [PaymentMethodEnum.PIX]:
        "https://http2.mlstatic.com/storage/logos-api-admin/f99fcca0-f3bd-11eb-9984-b7076edb0bb7-m.svg",
      [PaymentMethodEnum.CARD]:
        "https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg",
      [PaymentMethodEnum.TICKET]:
        "https://blog.br.tkelevator.com/wp-content/uploads/2023/04/boleto-logo.png",
    };
    return (
      icons[type] ||
      "https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg"
    );
  };

  // Processar métodos de pagamento
  const processedPaymentMethods: PaymentMethod[] = paymentMethods.map(
    (method) => ({
      ...method,
      icon: getPaymentMethodIcon(method.typePayment as PaymentMethodEnum),
    })
  );

  // Filtrar métodos de pagamento
  const filteredPaymentMethods = selectedPaymentType
    ? processedPaymentMethods.filter(
        (method) => method.typePayment === selectedPaymentType
      )
    : processedPaymentMethods;

  // Agrupar métodos por tipo
  const paymentMethodsByType = processedPaymentMethods.reduce((acc, method) => {
    if (!acc[method.typePayment]) {
      acc[method.typePayment] = [];
    }
    acc[method.typePayment].push(method);
    return acc;
  }, {} as Record<PaymentMethodEnum, PaymentMethod[]>);

  // Handlers
  const handlePaymentMethodSelect = (methodId: string) => {
    setPaymentMethodId(methodId);
    const selectedMethod = processedPaymentMethods.find(
      (method) => method.id === methodId
    );
    if (selectedMethod) {
      setSelectedPaymentType(selectedMethod.typePayment);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setShippingAddressId(addressId);
  };

  const formatAddress = (address: Address) => {
    const parts = [
      `${address.street}, ${address.number}`,
      address.complement,
      address.neighborhood,
      `${address.city} - ${address.state}`,
      address.zipCode,
    ].filter(Boolean);

    return parts.join(" • ");
  };

  // Função para finalizar a compra via cartão credito
  const handleCheckout = async () => {
    if (!shippingAddressId || !paymentMethodId) {
      alert("Por favor, selecione o endereço de entrega e método de pagamento");
      return;
    }
    setIsProcessing(true);

    try {
      router.push(
        `/checkout/card?product=${encodeURIComponent(
          JSON.stringify(productFillter)
        )}&subtotal=${
          productFillter?.price
        }&quantity=${selectedQuantity}&shippingAddress=${shippingAddressId}&paymentMethod=${paymentMethodId}`
      );
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      alert("Erro ao finalizar compra. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const productFillter = product?.productFillter;

  const handlePixPayment = async () => {
    if (!id || isNavigating || !userId) return;
    if (!shippingAddressId || !paymentMethodId) {
      alert("Por favor, selecione o endereço de entrega e método de pagamento");
      return;
    }

    setIsNavigating(true);
    try {
      router.push(
        `/checkout/pix?product=${encodeURIComponent(
          JSON.stringify(productFillter)
        )}&subtotal=${
          productFillter?.price
        }&quantity=${selectedQuantity}&shippingAddress=${shippingAddressId}&paymentMethod=${paymentMethodId}`
      );
    } finally {
      setIsNavigating(false);
    }
  };

  // Loading states
  if (addressesLoading || productLoading) {
    return (
      <div className="w-full mx-auto max-w-7xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-60 bg-gray-200 rounded"></div>
            </div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="w-full mx-auto max-w-7xl p-6">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <MapPin className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Endereço necessário</h3>
          <p className="text-gray-600 mb-4">
            Você precisa cadastrar um endereço antes de finalizar o pedido.
          </p>
          <Button
            onClick={() => router.push("/profile/addresses")}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Endereço
          </Button>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find(
    (addr) => addr.id === shippingAddressId
  );

  return (
    <div className="w-full mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="pb-6 border-b">
        <h2 className="text-2xl font-semibold">Finalizar compra</h2>
        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden">
            {product?.images?.[0] && (
              <Image
                src={product.images[0].url}
                alt={product.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-medium">{product?.title}</h3>
            <p className="text-lg font-semibold text-green-600">
              R$ {product?.price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
        {/* Coluna esquerda - Formulário */}
        <div className="space-y-8">
          {/* Seção de Endereço */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">
                Endereço de Entrega
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/profile/addresses")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Endereço
              </Button>
            </div>

            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingAddressId === address.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300"
                  } ${address.isDefault ? "ring-1 ring-blue-300" : ""}`}
                  onClick={() => handleAddressSelect(address.id)}
                >
                  <AddressInforCheckout
                    address={address}
                    shippingAddressId={shippingAddressId}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Seção de Pagamento */}
          <section>
            <Label className="text-lg font-semibold block mb-4">
              Método de Pagamento
            </Label>

            {/* Filtros de Tipo de Pagamento */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                type="button"
                variant={selectedPaymentType === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPaymentType("")}
              >
                Todos
              </Button>
              {Object.keys(paymentMethodsByType).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={selectedPaymentType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedPaymentType(type as PaymentMethodEnum)
                  }
                >
                  {type.replace("_", " ")}
                </Button>
              ))}
            </div>

            {/* Lista de Métodos de Pagamento */}
            <div className="space-y-3">
              <PaymentMethodCheckout
                filteredPaymentMethods={filteredPaymentMethods}
                handlePaymentMethodSelect={handlePaymentMethodSelect}
                paymentMethodId={paymentMethodId}
              />
            </div>

            {/* Informações do Método Selecionado */}
            {paymentMethodId && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-3">
                  Informações do pagamento:
                </h4>
                {selectedPaymentType === PaymentMethodEnum.PIX && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>• Pagamento instantâneo</p>
                    <p>• Código PIX será gerado após confirmação</p>
                    <p>• Válido por 30 minutos</p>
                  </div>
                )}
                {selectedPaymentType === PaymentMethodEnum.CARD && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>• Pagamento seguro com criptografia</p>
                    <p>• Parcelamento em até 12x</p>
                    <p>• Taxas podem ser aplicadas</p>
                  </div>
                )}
                {selectedPaymentType === PaymentMethodEnum.TICKET && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>• Boleto bancário</p>
                    <p>• Vencimento em 3 dias úteis</p>
                    <p>• Pagamento em qualquer agência ou internet banking</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Coluna direita - Resumo */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-zinc-900 border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Resumo do pedido</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Produto:</span>
                <span>R$ {product?.price.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Frete:</span>
                <span className="text-green-600 font-semibold">Grátis</span>
              </div>

              {selectedAddress && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 p-3 bg-white dark:bg-zinc-700 rounded border">
                  <div className="font-medium mb-1">Entrega em:</div>
                  <div>{formatAddress(selectedAddress)}</div>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Cupom de Desconto */}
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-2">
                Cupom de desconto
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Digite o código"
                  className="flex-1"
                />
                <Button variant="outline" disabled={!discountCode}>
                  Aplicar
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-2xl text-green-600">
                R$ {product?.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botão de Finalizar Compra */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
            onClick={() =>
              selectedPaymentType === "PIX"
                ? handlePixPayment()
                : handleCheckout()
            }
            disabled={!shippingAddressId || !paymentMethodId || isProcessing}
            size="lg"
          >
            {!shippingAddressId || !paymentMethodId
              ? "Selecione endereço e pagamento"
              : `Finalizar Compra • R$ ${product?.price.toFixed(2)}`}
          </Button>

          {/* Informações de Segurança */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>✅ Compra 100% segura • 🔒 Dados protegidos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutUniqProduct;
