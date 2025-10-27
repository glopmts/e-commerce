"use client";
import { useEffect, useState } from "react";
import { trpc } from "../server/trpc/client";

type Props = {
  userId: string;
  productId: string;
};

export const useFavorite = ({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) => {
  const utils = trpc.useUtils();
  const [isOptimisticLike, setIsOptimisticLike] = useState(false);

  const {
    data: isFavoriteFromServer,
    isLoading,
    refetch,
  } = trpc.favorite.existingFavorite.useQuery({ productId, userId });
  const {
    data: favoriteCount,
    isLoading: loader,
    refetch: refetchGetFavorite,
  } = trpc.favorite.getFavorite.useQuery({
    userId,
  });

  const addMutation = trpc.favorite.addFavorite.useMutation({
    onMutate: () => {
      setIsOptimisticLike(true);
    },
    onSuccess: () => {
      utils.favorite.existingFavorite.setData({ productId, userId }, true);
    },
    onError: (error) => {
      console.error("Add favorite error:", error);
      setIsOptimisticLike(false);
      utils.favorite.existingFavorite.invalidate({ productId, userId });
    },
  });

  const removeMutation = trpc.favorite.removeLikeReview.useMutation({
    onMutate: () => {
      setIsOptimisticLike(false);
    },
    onSuccess: () => {
      utils.favorite.existingFavorite.setData({ productId, userId }, false);
    },
    onError: (error) => {
      console.error("Remove favorite error:", error);
      setIsOptimisticLike(true);
      utils.favorite.existingFavorite.invalidate({ productId, userId });
    },
  });

  useEffect(() => {
    if (isFavoriteFromServer !== undefined) {
      setIsOptimisticLike(isFavoriteFromServer);
    }
  }, [isFavoriteFromServer]);

  const toggleLike = async () => {
    try {
      if (isOptimisticLike) {
        await removeMutation.mutateAsync({ productId, userId });
      } else {
        await addMutation.mutateAsync({ productId, userId });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      await refetch();
      await refetchGetFavorite();
    }
  };

  return {
    isInWishlist: isOptimisticLike,
    favoriteCount,
    loader,
    isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
    toggleLike,
  };
};
