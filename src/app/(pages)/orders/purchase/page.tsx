"use client";

import Fallback from "@/components/fallback";
import Title from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { trpc } from "@/server/trpc/client";
import { OrderStatus } from "@prisma/client";
import {
  ArrowUpRight,
  ShoppingBag,
  ShoppingBagIcon,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  orderStatusStyle,
  orderStatusStyleBorde,
  translateOrderStatus,
} from "./translate-status";
import { toast } from "sonner";

const PurchaseUser = () => {
  const { data: user, isLoading: loadingUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  const {
    data: purchases,
    isLoading: isLoaderPurchase,
    refetch: refetchPurchase,
  } = trpc.purchase.getUserOrders.useQuery();

  const mutationDelete = trpc.order.deleteOrder.useMutation();

  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  if (loadingUser || isLoaderPurchase) {
    return <Fallback />;
  }

  if (!purchases?.length) {
    return (
      <div className="w-full h-full min-h-screen p-2">
        <div className="pb-6">
          <Title>Minhas compras</Title>
        </div>
        <div className="w-full h-full flex items-center justify-center flex-col gap-2.5">
          <div className="">
            <div className="p-4 w-20 h-20 rounded-full shadow dark:bg-zinc-800 bg-gray-300 border items-center justify-center flex">
              <ShoppingBag size={29} />
            </div>
          </div>
          <span>Nenhuma compra encontrada!</span>
          <div className="mt-4">
            <Button variant="default" asChild>
              <Link href="/products">
                <span>Ver produtos</span>
                <ArrowUpRight size={16} className="animate-pulse" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getPaymentMethodIcon = (methodType: string) => {
    switch (methodType) {
      case "CREDIT_CARD":
        return <CreditCard size={14} />;
      case "PIX":
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case "BOLETO":
        return <div className="w-3 h-3 bg-orange-500 rounded-full" />;
      default:
        return <CreditCard size={14} />;
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!orderId || !user?.id) {
      alert("Necessario IDs User ou Comprar!");
    }
    try {
      await mutationDelete.mutateAsync({
        orderId,
        userId: user?.id as string,
      });
      await refetchPurchase();
      toast.success("Sucesso ao deletar comprar!");
    } catch (error) {
      toast.error("Error ao deletar comprar!" + error);
    }
  };

  return (
    <div className="w-full h-full min-h-screen p-2 max-w-6xl mx-auto mt-4">
      <div className="pb-6 flex items-center gap-2">
        <ShoppingBagIcon size={26} />
        <div className="flex flex-col">
          <Title className="mb-1">Minhas compras</Title>
          <span className="text-sm text-zinc-300">
            Gerencie suas compras em unica pagina
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchases.map((order) => {
            const primaryProduct = order.orderItems[1]?.product;
            const primaryImage =
              primaryProduct?.images.find((img) => img.isPrimary) ||
              primaryProduct?.images[0];
            const totalItems = order.orderItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <Card
                key={order.id}
                className={`w-full h-full hover:shadow-lg transition-shadow duration-300`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start w-full h-full relative">
                    {/* Product Image */}
                    <div className="relative">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={
                            primaryImage.altText ||
                            primaryProduct?.title ||
                            "Produto"
                          }
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <ShoppingBag size={24} className="text-gray-400" />
                        </div>
                      )}
                      {totalItems > 1 && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          +{totalItems - 1}
                        </div>
                      )}
                    </div>

                    {/* Button delete */}

                    <div className="absolute bottom-0 right-0">
                      <Button
                        variant="destructive"
                        className="cursor-pointer hover:opacity-75 rounded-full"
                        onClick={() => handleDelete(order.id)}
                      >
                        {order.status === "CONFIRMED" ? (
                          <span>Deletar</span>
                        ) : (
                          <span>Cancelar</span>
                        )}
                      </Button>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Pedido #{order.orderNumber}
                          </p>
                          {/* Data da compra */}
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusStyle(
                            order.status
                          )}`}
                        >
                          {translateOrderStatus(order.status)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {totalItems} item{totalItems > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Total: {formatCurrency(order.finalAmount)}
                        </p>

                        {/* Método de pagamento */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getPaymentMethodIcon(
                              order.paymentMethod.typePayment
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.paymentMethod.name}
                            </p>
                          </div>
                          {/* Responsabilidade */}
                          <div className="flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.name || "Cliente"}
                            </p>
                          </div>
                        </div>

                        {/* Data de pagamento se existir */}
                        {order.paidAt && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-green-500" />
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Pago em: {formatDate(order.paidAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full cursor-pointer"
                          onClick={() =>
                            router.push(`/orders/details/${order.id}`)
                          }
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PurchaseUser;
