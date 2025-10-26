"use client";

import { EllipsisVertical, Flag, Star } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Reviews } from "../../types/interfaces";
import { formatDateFns } from "../../utils/format-name";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import FullScreenReview from "./full-screen-review";
import LikeReview from "./like-review";

type RenderReviewsProps = {
  reviews: Reviews[];
  userId: string;
  titleProduct?: string;
  handleDelete?: (reviewId: string, userId: string) => void;
};

const RenderReviews = ({
  reviews,
  userId,
  titleProduct,
  handleDelete,
}: RenderReviewsProps) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);

  const handleOpenMenu = (index: number) => {
    setSelectedReviewIndex(index);
    setOpenMenu(true);
  };

  const sortedReviews = useMemo(() => {
    if (!reviews.length) return [];

    return [...reviews].sort((a, b) => {
      // Se 'a' é do usuário atual e 'b' não é, 'a' vem primeiro
      if (a.userId === userId && b.userId !== userId) return -1;
      // Se 'b' é do usuário atual e 'a' não é, 'b' vem primeiro
      if (b.userId === userId && a.userId !== userId) return 1;
      // Se ambos são ou não são do usuário atual, mantém a ordem original
      return 0;
    });
  }, [reviews, userId]);

  const ratingStats = useMemo(() => {
    const totalReviews = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      const rating = Math.max(1, Math.min(5, Math.round(review.rating)));
      ratingCounts[rating as keyof typeof ratingCounts]++;
      totalRating += review.rating;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const featureRatings = [
      { name: "Custo-benefício", rating: 4.5 },
      { name: "Velocidade de uso", rating: 4.3 },
      { name: "Capacidade", rating: 4.6 },
    ];

    return {
      averageRating,
      totalReviews,
      ratingCounts,
      featureRatings,
    };
  }, [reviews]);

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="pb-6 flex items-center gap-1.5">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl font-semibold">Avaliações</h2>
      </div>
      <div className="flex w-full h-full gap-8">
        {/* Sidebar with rating statistics */}
        <div className="w-64 flex-shrink-0">
          {/* Overall rating */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold">
                {ratingStats.averageRating.toFixed(1)}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(ratingStats.averageRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-zinc-300 fill-zinc-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {ratingStats.totalReviews} avaliações
            </p>
          </div>

          {/* Rating distribution bars */}
          <div className="space-y-2 mb-8">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                ratingStats.ratingCounts[
                  rating as keyof typeof ratingStats.ratingCounts
                ];
              const percentage =
                ratingStats.totalReviews > 0
                  ? (count / ratingStats.totalReviews) * 100
                  : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-3 text-muted-foreground">
                    {rating}
                  </span>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="text-sm w-8 text-right text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Feature ratings */}
          <div>
            <h3 className="text-base font-semibold mb-4">
              Avaliação de características
            </h3>
            <div className="space-y-3">
              {ratingStats.featureRatings.map((feature, index) => (
                <div key={index}>
                  <p className="text-sm mb-1">{feature.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(feature.rating)
                            ? "text-yellow-500 fill-yellow-500"
                            : i < feature.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-zinc-300 fill-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <ScrollArea className="h-full flex-1">
          <div className="w-full  md:w-lg h-full space-y-6 pr-4">
            {sortedReviews.map((review, index) => (
              <div className="" key={review.id}>
                {review.images && review.images.length > 0 && (
                  <>
                    <div className="pb-1">
                      <h2 className="text-base font-semibold">
                        Opiniões com fotos
                      </h2>
                    </div>
                    <Carousel
                      opts={{
                        align: "start",
                      }}
                      className="w-full max-w-sm"
                    >
                      <CarouselContent>
                        {review.images.map((image, imgIndex) => (
                          <CarouselItem
                            key={imgIndex}
                            onClick={() => handleOpenMenu(index)}
                            className="md:basis-1/2 lg:basis-1/3 cursor-pointer"
                          >
                            <div className="p-1">
                              <Card className="p-0">
                                <CardContent className="flex relative p-0 aspect-[2/3] rounded-md items-center justify-center">
                                  <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`Review Image ${imgIndex + 1}`}
                                    fill
                                    className="h-full w-full object-cover rounded-md"
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </>
                )}
                <div className="mt-6">
                  <div className="pb-4">
                    <h1 className="text-xl font-semibold">
                      {review.userId === userId
                        ? "Sua Avaliação"
                        : "Opiniões em destaque"}
                    </h1>
                  </div>
                  <div className="w-full h-full flex items-center">
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-2 justify-between">
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.max(0, Math.min(5, review.rating))
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-zinc-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {userId === review.userId && (
                            <span className="text-sm font-medium text-blue-500">
                              (Sua Avaliação)
                            </span>
                          )}
                          <span className="text-sm dark:text-zinc-300 text-zinc-500">
                            {formatDateFns(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-auto flex justify-between items-center mt-3">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm">{review.comment}</p>
                          <LikeReview userId={userId} reviewId={review.id} />
                        </div>
                        <div className="">
                          <DropdownMenuReviews
                            userId={userId}
                            userIdReview={review.userId}
                            handleDelete={() =>
                              handleDelete?.(review.id, userId)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className=""></div>
      </div>

      {openMenu && (
        <FullScreenReview
          openChange={() => setOpenMenu(false)}
          open={openMenu}
          userId={userId}
          reviews={sortedReviews}
          initialReviewIndex={selectedReviewIndex}
        />
      )}
    </div>
  );
};

const DropdownMenuReviews = ({
  handleDelete,
  userId,
  userIdReview,
}: {
  handleDelete: () => void;
  userId: string;
  userIdReview: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {userId === userIdReview && (
          <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
            Deletar Avaliação
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Flag size={20} /> Denunciar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RenderReviews;
