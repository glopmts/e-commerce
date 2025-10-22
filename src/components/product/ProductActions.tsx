"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Share2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { trpc } from "../../server/trpc/client";

interface ProductActionsProps {
  productId: string;
  isActive: boolean;
  stock: number;
  userId: string;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

export function ProductActions({
  productId,
  isActive,
  stock,
  userId,
  onAddToCart,
  onAddToWishlist,
}: ProductActionsProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const utils = trpc.useUtils();

  const { data: cartData, refetch } = trpc.cart.getCart.useQuery(undefined, {
    enabled: !!userId,
  });

  const existingCartItem = cartData?.find(
    (item) => item.productId === productId
  );

  const addOrUpdateCart = trpc.cart.addOrUpdateCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      onAddToCart?.();
      refetch();
    },
  });

  const removeFromCart = trpc.cart.deleteCart.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      refetch();
    },
  });

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    const finalQuantity = existingCartItem
      ? existingCartItem.quantity + quantity
      : quantity;

    addOrUpdateCart.mutate({
      productId,
      userId,
      quantity: finalQuantity,
    });
    await refetch();
  };

  const handleRemoveFromCart = async () => {
    if (existingCartItem) {
      removeFromCart.mutate({
        cartId: existingCartItem.id,
        userId,
      });
      await refetch();
    }
  };

  const handleWishlistToggle = () => {
    setIsInWishlist(!isInWishlist);
    onAddToWishlist?.();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Confira este produto",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para área de transferência!");
    }
  };

  const canAddToCart = isActive && stock > 0;
  const isInCart = !!existingCartItem;

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-6">
      {/* Quantity Selector */}
      {canAddToCart && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Quantidade:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || addOrUpdateCart.isPending}
            >
              -
            </Button>
            <span className="w-12 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              disabled={quantity >= stock || addOrUpdateCart.isPending}
            >
              +
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="lg"
          className="flex-1"
          disabled={!canAddToCart || addOrUpdateCart.isPending}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 size-4" />
          {addOrUpdateCart.isPending
            ? "Adicionando..."
            : !isActive
            ? "Indisponível"
            : stock === 0
            ? "Esgotado"
            : isInCart
            ? `Adicionar Mais (${existingCartItem.quantity} no carrinho)`
            : "Adicionar ao Carrinho"}
        </Button>

        {isInCart && (
          <Button
            size="lg"
            variant="destructive"
            onClick={handleRemoveFromCart}
            disabled={removeFromCart.isPending}
          >
            {removeFromCart.isPending ? "Removendo..." : "Remover"}
          </Button>
        )}

        <Button
          size="lg"
          variant="outline"
          onClick={handleWishlistToggle}
          disabled={addOrUpdateCart.isPending}
          className={cn(isInWishlist && "bg-accent text-accent-foreground")}
        >
          <Heart className={cn("size-4", isInWishlist && "fill-current")} />
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={handleShare}
          disabled={addOrUpdateCart.isPending}
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
