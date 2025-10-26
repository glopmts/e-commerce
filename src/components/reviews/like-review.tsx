"use client";

import { ThumbsUp } from "lucide-react";
import { useLikeReview } from "../../hooks/use-like-review";
import { Button } from "../ui/button";

type Props = {
  userId: string;
  reviewId: string;
};

const LikeReview = ({ reviewId, userId }: Props) => {
  const { isLike, isLoading, likeCount, loader, toggleLike } = useLikeReview({
    reviewId,
    userId,
  });

  return (
    <Button
      onClick={toggleLike}
      disabled={isLoading || loader}
      className={`like-button w-29 rounded-full cursor-pointer ${
        isLike ? "like" : ""
      }`}
      aria-label={isLike ? "Remover dos likes" : "Adicionar aos likes"}
      size="sm"
      variant="secondary"
    >
      <span>É útil</span>
      {isLike ? (
        <ThumbsUp size={24} fill="blue" stroke="blue" />
      ) : (
        <ThumbsUp size={24} fill="none" stroke="blue" />
      )}
      <span>{likeCount?.length}</span>
    </Button>
  );
};

export default LikeReview;
