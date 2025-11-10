"use client";

import { CartSkeleton } from "@/components/fallback";
import Title from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/server/trpc/client";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const CartItemsPage = () => {
  const utils = trpc.useUtils();

  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });

  const userId = user?.id;

  const { data: cartData, isLoading: isLoadingCart } =
    trpc.cart.getCart.useQuery({ userId: userId! }, { enabled: !!userId });

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Mutation para atualizar quantidade
  const updateCartQuantity = trpc.cart.addOrUpdateCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  // Mutation para remover item
  const removeFromCart = trpc.cart.deleteCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const handleAddQuantity = async (
    productId: string,
    currentQuantity: number
  ) => {
    if (!userId) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      await updateCartQuantity.mutateAsync({
        productId,
        userId,
        quantity: currentQuantity + 1,
      });
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveQuantity = async (
    productId: string,
    currentQuantity: number,
    cartItemId: string
  ) => {
    if (!userId) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      if (currentQuantity <= 1) {
        await removeFromCart.mutateAsync({
          cartId: cartItemId,
          userId,
        });
      } else {
        await updateCartQuantity.mutateAsync({
          productId,
          userId,
          quantity: currentQuantity - 1,
        });
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!userId) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    try {
      await removeFromCart.mutateAsync({
        cartId: cartItemId,
        userId,
      });
    } catch (error) {
      console.error("Erro ao remover item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  // Calcular totais
  const cartTotal =
    cartData?.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0) || 0;

  const totalItems =
    cartData?.reduce((total, item) => {
      return total + item.quantity;
    }, 0) || 0;

  if (loaderUser || isLoadingCart) {
    return <CartSkeleton />;
  }

  if (!userId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 min-h-screen mt-4">
        <div className="text-center py-8">
          <p>Faça login para ver seu carrinho</p>
          <Link href="/login">
            <Button className="mt-4">Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-2 min-h-screen h-full mt-4">
      <div className="pb-3">
        <Title>Meu carrinho</Title>
        <Separator />
      </div>

      <div className="w-full h-full flex gap-2.5 md:gap-6 flex-col md:flex-row">
        {/* Lista de Itens */}
        <div className="flex-1">
          {!cartData || cartData.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto size-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold">Seu carrinho está vazio</p>
              <Link href="/products">
                <Button className="mt-4">Continuar comprando</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {cartData.map((item) => {
                const isUpdating =
                  updatingItems.has(item.id) ||
                  updatingItems.has(item.productId);
                const canAddMore = item.product.stock > item.quantity;

                return (
                  <Card key={item.id} className="w-full">
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Imagem do produto */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="shrink-0"
                      >
                        <div className="w-40 h-40 relative">
                          <Image
                            src={
                              item.product.thumbnail ||
                              item.product.images?.[0]?.url ||
                              "/placeholder.svg"
                            }
                            alt={item.product.title}
                            fill
                            sizes="80px"
                            className="rounded-md object-cover hover:opacity-75 transition-opacity"
                          />
                        </div>
                      </Link>

                      {/* Informações do produto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="hover:underline"
                          >
                            <h3 className="font-semibold line-clamp-2">
                              {item.product.title}
                            </h3>
                          </Link>

                          {/* Botão remover item completamente */}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating}
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex flex-col">
                            <span className="text-base font-bold">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.product.price)}
                            </span>

                            {/* Controles de quantidade */}
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isUpdating || item.quantity <= 1}
                                onClick={() =>
                                  handleRemoveQuantity(
                                    item.productId,
                                    item.quantity,
                                    item.id
                                  )
                                }
                              >
                                <Minus size={14} />
                              </Button>

                              <span className="text-sm font-medium min-w-8 text-center">
                                {item.quantity}
                              </span>

                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                disabled={isUpdating || !canAddMore}
                                onClick={() =>
                                  handleAddQuantity(
                                    item.productId,
                                    item.quantity
                                  )
                                }
                              >
                                <Plus size={14} />
                              </Button>
                            </div>

                            <Badge variant="outline" className="text-xs mt-3">
                              Estoque: {item.product.stock}
                            </Badge>
                          </div>

                          <div className="text-right">
                            <span className="font-bold">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo do pedido */}
        {cartData && cartData.length > 0 && (
          <div className="md:w-80 lg:w-96 h-fit sticky top-4">
            <Card>
              <CardContent className="p-4">
                <div className="pb-3">
                  <Title level={6}>Resumo da compra</Title>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Itens ({totalItems})</span>
                    <span>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(cartTotal)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(cartTotal)}
                    </span>
                  </div>

                  <Button
                    className="w-full mt-4 cursor-pointer rounded-full"
                    size="lg"
                  >
                    Finalizar Compra
                  </Button>

                  <Link href="/products" className="block">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer  rounded-full"
                    >
                      Continuar Comprando
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItemsPage;
