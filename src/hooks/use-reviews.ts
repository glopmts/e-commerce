import { useCallback } from "react";
import { trpc } from "../server/trpc/client";

type ReviewData = {
  productId: string;
  userId: string;
};

export const useReviews = ({ productId, userId }: ReviewData) => {
  const utils = trpc.useUtils();

  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = trpc.review.getReviewsByProductId.useQuery({
    productId,
  });

  const { data: hasReview, isLoading: isLoadingHasReview } =
    trpc.review.existsReviewByUserAndProduct.useQuery({
      productId,
      userId,
    });

  const createReviewMutation = trpc.review.createReview.useMutation({
    onSuccess: () => {
      utils.review.getReviewsByProductId.invalidate({ productId });
      refetch();
    },
  });

  const deleteReview = trpc.review.deleteReview.useMutation({
    onSuccess: () => {
      utils.review.getReviewsByProductId.invalidate({ productId });
      refetch();
    },
  });

  const createReview = useCallback(
    async (reviewData: any) => {
      return await createReviewMutation.mutateAsync({
        ...reviewData,
        productId,
        userId,
      });
    },
    [createReviewMutation, productId, userId]
  );

  const removeReview = useCallback(
    async (id: string) => {
      const confirmed = window.confirm(
        "Tem certeza que deseja deletar esta avaliação?"
      );
      if (!confirmed) return;
      return await deleteReview.mutateAsync({ reviewId: id, userId });
    },
    [deleteReview, productId, userId]
  );

  return {
    reviews,
    isLoading,
    error,
    hasReview,
    isLoadingHasReview,
    isCreating: createReviewMutation.isPending,
    isDeleting: deleteReview.isPending,
    createReview,
    removeReview,
  };
};
