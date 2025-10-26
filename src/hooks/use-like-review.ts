"use client";
import { useEffect, useState } from "react";
import { trpc } from "../server/trpc/client";

type Props = {
  userId: string;
  reviewId: string;
};

export const useLikeReview = ({
  reviewId,
  userId,
}: {
  reviewId: string;
  userId: string;
}) => {
  const utils = trpc.useUtils();
  const [isOptimisticLike, setIsOptimisticLike] = useState(false);

  const {
    data: isLikeFromServer,
    isLoading,
    refetch,
  } = trpc.likeReview.existingLikeReview.useQuery({ reviewId, userId });
  const {
    data: likeCount,
    isLoading: loader,
    refetch: refetchGetLike,
  } = trpc.likeReview.getLike.useQuery({
    reviewId,
  });

  const addMutation = trpc.likeReview.addLikeReview.useMutation({
    onMutate: () => {
      setIsOptimisticLike(true);
    },
    onSuccess: () => {
      utils.likeReview.existingLikeReview.setData({ reviewId, userId }, true);
    },
    onError: (error) => {
      console.error("Add like error:", error);
      setIsOptimisticLike(false);
      utils.likeReview.existingLikeReview.invalidate({ reviewId, userId });
    },
  });

  const removeMutation = trpc.likeReview.removeLikeReview.useMutation({
    onMutate: () => {
      setIsOptimisticLike(false);
    },
    onSuccess: () => {
      utils.likeReview.existingLikeReview.setData({ reviewId, userId }, false);
    },
    onError: (error) => {
      console.error("Remove like error:", error);
      setIsOptimisticLike(true);
      utils.likeReview.existingLikeReview.invalidate({ reviewId, userId });
    },
  });

  useEffect(() => {
    if (isLikeFromServer !== undefined) {
      setIsOptimisticLike(isLikeFromServer);
    }
  }, [isLikeFromServer]);

  const toggleLike = async () => {
    try {
      if (isOptimisticLike) {
        await removeMutation.mutateAsync({ reviewId, userId });
      } else {
        await addMutation.mutateAsync({ reviewId, userId });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      await refetch();
      await refetchGetLike();
    }
  };

  return {
    isLike: isOptimisticLike,
    likeCount,
    loader,
    isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
    toggleLike,
  };
};
