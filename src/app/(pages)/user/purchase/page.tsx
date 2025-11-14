"use client";

import Fallback from "@/components/fallback";
import Title from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { trpc } from "@/server/trpc/client";
import { OrderStatus } from "@prisma/client";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "../../../../components/ui/card";

const PurchaseUser = () => {
  const { data: user, isLoading: loadingUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });
  const userId = user?.id as string;
  const {
    data: purchases,
    isLoading: isLoaderPurchase,
    refetch: refetchPurchase,
  } = trpc.purchase.getUserOrders.useQuery();
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

  const translateOrderStatus = (status: OrderStatus): string => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "CONFIRMED":
        return "Confirmado";
      case "PROCESSING":
        return "Em processamento";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregue";
      case "CANCELLED":
        return "Cancelado";
      case "REFUNDED":
        return "Reembolsado";
      default:
        return status;
    }
  };

  const orderStatusStyle = (status: OrderStatus): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PROCESSING":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "SHIPPED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="w-full h-full min-h-screen p-2">
      <div className="pb-6">
        <Title>Minhas compras</Title>
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
                className="w-full h-full hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start w-full h-full">
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

                    {/* Order Details */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Pedido #{order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.paymentMethod.name}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          Ver detalhes
                        </Button>
                        {order.status === "DELIVERED" && (
                          <Button variant="ghost" size="sm">
                            Avaliar
                          </Button>
                        )}
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