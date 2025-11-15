"use client";

import Title from "@/components/TitleComponent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/server/trpc/client";
import Fallback from "@/components/fallback";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

const getStatusInfo = (status: string) => {
  const statusMap: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: any;
      label: string;
    }
  > = {
    PENDING: { variant: "outline", icon: Clock, label: "Pendente" },
    CONFIRMED: { variant: "default", icon: CheckCircle2, label: "Confirmado" },
    PROCESSING: { variant: "secondary", icon: RefreshCw, label: "Processando" },
    SHIPPED: { variant: "default", icon: Truck, label: "Enviado" },
    DELIVERED: { variant: "default", icon: CheckCircle2, label: "Entregue" },
    CANCELLED: { variant: "destructive", icon: XCircle, label: "Cancelado" },
    REFUNDED: { variant: "destructive", icon: RefreshCw, label: "Reembolsado" },
  };
  return statusMap[status] || statusMap.PENDING;
};

const getPaymentStatusInfo = (status: string) => {
  const statusMap: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    PENDING: { variant: "outline", label: "Pendente" },
    PROCESSING: { variant: "secondary", label: "Processando" },
    COMPLETED: { variant: "default", label: "Pago" },
    FAILED: { variant: "destructive", label: "Falhou" },
    REFUNDED: { variant: "destructive", label: "Reembolsado" },
    CANCELLED: { variant: "destructive", label: "Cancelado" },
  };
  return statusMap[status] || statusMap.PENDING;
};

const OrderDetails = () => {
  const { id } = useParams();
  const { data: user, isLoading: loadingUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  const { data: purchases, isLoading: isLoaderPurchase } =
    trpc.purchase.getOrder.useQuery({
      id: id as string,
    });

  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  if (loadingUser || isLoaderPurchase) {
    return <Fallback />;
  }

  if (!purchases) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-screen p-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Pedido não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(purchases.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Title>Detalhes da Compra</Title>
        <p className="text-muted-foreground mt-2">
          Pedido #{purchases.orderNumber}
        </p>
      </div>

      {/* Status and Date Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <StatusIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Status do Pedido
                </p>
                <Badge variant={statusInfo.variant} className="mt-1">
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data do Pedido</p>
                <p className="font-medium">{formatDate(purchases.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchases.orderItems?.map((item: any, index: number) => (
                <div key={item.id}>
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="flex flex-col sm:flex-row gap-4 hover:bg-zinc-900 p-4 rounded-md transition-discrete"
                  >
                    {/* Product Image */}
                    <div className="size-20 sm:size-24 bg-muted rounded-lg shrink-0 overflow-hidden">
                      {item.product?.thumbnail ? (
                        <img
                          src={item.product.thumbnail || "/placeholder.svg"}
                          alt={item.product?.title || "Produto"}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <Package className="size-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-balance">
                          {item.product?.title || "Produto"}
                        </h4>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            Variante: {item.variant.name}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="text-muted-foreground">
                          Quantidade:{" "}
                          <span className="font-medium text-foreground">
                            {item.quantity}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          Preço unitário:{" "}
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </span>
                      </div>

                      {item.discountApplied > 0 && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-md">
                          <span>
                            Desconto aplicado:{" "}
                            {formatCurrency(item.discountApplied)}
                          </span>
                        </div>
                      )}

                      <div className="pt-1">
                        <p className="text-base font-bold">
                          Total: {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {index < purchases.orderItems.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Dates */}
          {(purchases.paidAt ||
            purchases.shippedAt ||
            purchases.deliveredAt) && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {purchases.paidAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Pagamento Confirmado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(purchases.paidAt)}
                      </p>
                    </div>
                  </div>
                )}
                {purchases.shippedAt && (
                  <div className="flex items-center gap-3">
                    <Truck className="size-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Pedido Enviado</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(purchases.shippedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {purchases.deliveredAt && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Pedido Entregue</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(purchases.deliveredAt)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Summary and Details */}
        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(purchases.totalAmount)}
                </span>
              </div>

              {purchases.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Desconto {purchases.isPixDiscount && "(PIX)"}
                  </span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(purchases.discountAmount)}
                  </span>
                </div>
              )}

              {purchases.discount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cupom</span>
                  <Badge variant="outline" className="text-xs">
                    {purchases.discount.name}
                  </Badge>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span className="font-medium">
                  {purchases.shippingAmount > 0
                    ? formatCurrency(purchases.shippingAmount)
                    : "Grátis"}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(purchases.finalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <address className="text-sm not-italic space-y-1 text-muted-foreground">
                <p className="font-medium text-foreground">
                  {purchases.shippingAddress?.street},{" "}
                  {purchases.shippingAddress?.number}
                </p>
                {purchases.shippingAddress?.complement && (
                  <p>{purchases.shippingAddress.complement}</p>
                )}
                <p>{purchases.shippingAddress?.neighborhood}</p>
                <p>
                  {purchases.shippingAddress?.city} -{" "}
                  {purchases.shippingAddress?.state}
                </p>
                <p>CEP: {purchases.shippingAddress?.zipCode}</p>
              </address>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Método</p>
                <p className="font-medium">
                  {purchases.paymentMethod?.name || "Não informado"}
                </p>
              </div>

              {purchases.payments && purchases.payments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  {purchases.payments.map((payment: any) => {
                    const paymentInfo = getPaymentStatusInfo(payment.status);
                    return (
                      <Badge key={payment.id} variant={paymentInfo.variant}>
                        {paymentInfo.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {purchases.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {purchases.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
