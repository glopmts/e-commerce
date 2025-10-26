"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Reviews } from "@/types/interfaces";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import LikeReview from "./like-review";

type Props = {
  reviews: Reviews[];
  open?: boolean;
  userId: string;
  openChange: () => void;
  initialReviewIndex?: number;
};

const FullScreenReview = ({
  reviews,
  open,
  userId,
  openChange,
  initialReviewIndex = 0,
}: Props) => {
  const [currentReviewIndex, setCurrentReviewIndex] =
    useState(initialReviewIndex);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentReview = reviews[currentReviewIndex];
  const hasImages = currentReview?.images && currentReview.images.length > 0;
  const totalReviews = reviews.length;

  const goToNextReview = () => {
    if (currentReviewIndex < totalReviews - 1) {
      setCurrentReviewIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    }
  };

  const goToPreviousReview = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex((prev) => prev - 1);
      setCurrentImageIndex(0);
    }
  };

  const goToNextImage = () => {
    if (hasImages && currentImageIndex < currentReview.images.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  if (!currentReview) return null;

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="w-full md:max-w-7xl h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={openChange}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">Opiniões com fotos</h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Image Display */}
          <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
            {hasImages ? (
              <>
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <div className="relative w-full h-full max-w-2xl max-h-full">
                    <Image
                      src={
                        currentReview.images[currentImageIndex] ||
                        "/placeholder.svg"
                      }
                      alt={`Review image ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Image Navigation Buttons */}
                {currentReview.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                      onClick={goToPreviousImage}
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                      onClick={goToNextImage}
                      disabled={
                        currentImageIndex === currentReview.images.length - 1
                      }
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {currentReview.images.length}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Sem imagens</div>
            )}
          </div>

          {/* Right Side - Review Details */}
          <div className="w-96 border-l flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.max(0, Math.min(5, currentReview.rating))
                        ? "text-blue-500 fill-blue-500"
                        : "text-zinc-300 fill-zinc-300"
                    )}
                  />
                ))}
              </div>

              {/* Date */}
              <div className="text-sm text-muted-foreground">
                {new Date(currentReview.createdAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {/* Comment */}
              {currentReview.comment && (
                <div className="text-sm leading-relaxed">
                  {currentReview.comment}
                </div>
              )}

              {/* Helpful Button */}
              <LikeReview userId={userId} reviewId={currentReview.id} />
            </div>

            {/* Thumbnail Strip */}
            {hasImages && currentReview.images.length > 1 && (
              <div className="border-t p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {currentReview.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                        currentImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-transparent hover:border-zinc-300"
                      )}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Navigation */}
        {totalReviews > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-background">
            <Button
              variant="outline"
              onClick={goToPreviousReview}
              disabled={currentReviewIndex === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Review Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Review {currentReviewIndex + 1} de {totalReviews}
            </span>
            <Button
              variant="outline"
              onClick={goToNextReview}
              disabled={currentReviewIndex === totalReviews - 1}
              className="gap-2 bg-transparent"
            >
              Próxima Review
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenReview;
