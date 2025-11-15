"use client";

import { CartSkeleton } from "@/components/fallback";
import Title from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/server/trpc/client";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CartItem } from "./cart-item";
import { EmptyCart } from "./empty-cart";
import { CartSummary } from "./cart-summary";
import { Label } from "@/components/ui/label";
import AddressInfor from "@/components/checkout/address-infor";
import { useRouter } from "next/navigation";

const CartItemsPage = () => {
  const utils = trpc.useUtils();

  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery(undefined, {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });

  const userId = user?.id as string;

  const {
    data: cartData,
    isLoading: isLoadingCart,
    refetch,
  } = trpc.cart.getCart.useQuery({ userId: userId! }, { enabled: !!userId });

  const { data: addresses = [], isLoading: addressesLoading } =
    trpc.address.getAddresses.useQuery({
      userId,
    });

  // Estados
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [isDelete, setDelete] = useState(false);
  const [shippingAddressId, setShippingAddressId] = useState<string>(() => {
    // Define o endereço padrão automaticamente
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    return defaultAddress?.id || addresses[0]?.id || "";
  });
  const router = useRouter();

  // Funções
  const handleAddressSelect = (addressId: string) => {
    setShippingAddressId(addressId);
  };

  const handleSelectAll = useCallback(() => {
    if (!cartData) return;

    if (selectedProducts.size === cartData.length) {
      setSelectedProducts(new Set());
    } else {
      const allItemIds = new Set(cartData.map((item) => item.id));
      setSelectedProducts(allItemIds);
    }
  }, [cartData, selectedProducts.size]);

  // Selecionar/deselecionar item individual
  const handleSelectProduct = useCallback(
    (productId: string, selected: boolean) => {
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
    },
    []
  );

  // Remover itens selecionados
  const handleRemoveSelected = async () => {
    if (!userId || selectedProducts.size === 0) return;

    setDelete(true);
    try {
      const removePromises = Array.from(selectedProducts).map((cartItemId) =>
        removeFromCart.mutateAsync({
          cartId: cartItemId,
          userId,
        })
      );

      await Promise.all(removePromises);
      setSelectedProducts(new Set());
      await refetch();
      toast.success(
        `${selectedProducts.size} item(ns) removido(s) com sucesso`
      );
    } catch (error) {
      toast.error("Erro ao remover itens selecionados: " + error);
    } finally {
      setDelete(false);
    }
  };

  // Calcular totais apenas dos itens selecionados
  const { selectedTotal, selectedItemsCount, selectedItems } = useMemo(() => {
    if (!cartData)
      return { selectedTotal: 0, selectedItemsCount: 0, selectedItems: [] };

    const selectedItems = cartData.filter((item) =>
      selectedProducts.has(item.id)
    );
    const selectedTotal = selectedItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const selectedItemsCount = selectedItems.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    return { selectedTotal, selectedItemsCount, selectedItems };
  }, [cartData, selectedProducts]);

  const updateCartQuantity = trpc.cart.addOrUpdateCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const removeFromCart = trpc.cart.deleteCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
    },
  });

  const removeAllCart = trpc.cart.clearCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      setSelectedProducts(new Set());
    },
  });

  useEffect(() => {
    handleSelectAll();
  }, []);

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
      toast.error("Erro ao adicionar item:" + error);
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
      toast.error("Erro ao remover item" + error);
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
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    } catch (error) {
      toast.error("Erro ao remover item" + error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveAllItem = async () => {
    if (!userId) return;
    setDelete(true);

    try {
      await removeAllCart.mutateAsync({
        userId,
      });
      setSelectedProducts(new Set());
      await refetch();
    } catch (error) {
      toast.error("Erro ao remover items do carrinho" + error);
    } finally {
      setDelete(false);
    }
  };

  if (loaderUser || isLoadingCart) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 mt-4 min-h-screen h-full">
        <CartSkeleton />
      </div>
    );
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

  const cartInfor = cartData && cartData.length > 1;

  return (
    <div className="w-full max-w-6xl mx-auto p-2 min-h-screen h-full mt-4">
      <div className="pb-3">
        <div className="flex justify-between w-full h-auto pb-2">
          <Title>Meu carrinho</Title>
          {cartInfor && (
            <Button
              variant="ghost"
              disabled={isDelete}
              onClick={handleRemoveAllItem}
              className="h-auto gap-2 font-semibold"
              title="Remover todos os items do carrinho!"
            >
              <Trash2 size={16} className="text-red-500" /> Deletar Todos
            </Button>
          )}
        </div>
        <Separator />
      </div>

      <div className="w-full h-full flex gap-2.5 md:gap-6 flex-col md:flex-row">
        <div className="flex flex-col gap-2.5 flex-1">
          {/* Lista de Itens */}
          <div className="space-y-8">
            {/* Seção de Endereço */}
            {cartInfor && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">
                    Endereço de Entrega
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => router.push("/user/addresses")}
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
                      <AddressInfor
                        address={address}
                        shippingAddressId={shippingAddressId}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="flex-1">
            {!cartData || cartData.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {cartData.map((item) => {
                  const isUpdating =
                    updatingItems.has(item.id) ||
                    updatingItems.has(item.productId);

                  return (
                    <CartItem
                      key={item.id}
                      item={item}
                      isUpdating={isUpdating}
                      isSelected={selectedProducts.has(item.id)}
                      onSelect={handleSelectProduct}
                      onAddQuantity={handleAddQuantity}
                      onRemoveQuantity={handleRemoveQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resumo do pedido */}
        {cartData && cartData.length > 0 && (
          <CartSummary
            totalItems={selectedItemsCount}
            cartTotal={selectedTotal}
            selectedItems={selectedProducts}
            cartData={cartData}
            shippingAddressId={shippingAddressId}
          />
        )}
      </div>
    </div>
  );
};

export default CartItemsPage;
