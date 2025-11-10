"use client";

import { Heart } from "lucide-react";
import { useFavorite } from "../../hooks/use-favorite";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

type Props = {
  userId: string;
  productId: string;
};

const FavoriteButton = ({ productId, userId }: Props) => {
  const { isInWishlist, isLoading, favoriteCount, loader, toggleLike } =
    useFavorite({
      productId,
      userId,
    });

  return (
    <Button
      onClick={toggleLike}
      disabled={isLoading || loader}
      className={cn(isInWishlist && "bg-accent text-accent-foreground")}
      aria-label={
        isInWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      size="lg"
      variant="outline"
    >
      <Heart className={cn("size-5", isInWishlist && "fill-blue-600")} />
    </Button>
  );
};

export default FavoriteButton;
