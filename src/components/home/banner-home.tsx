"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc/client";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDominantColor } from "../../utils/getDominatColor";

type Timeout = ReturnType<typeof setTimeout>;

interface BannerProduct {
  thumbnail?: string;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  title: string;
  slug: string;
  comparePrice?: number;
  price: number;
}

export default function ClearanceBanner() {
  const {
    data: banners,
    isLoading,
    error,
  } = trpc.product.getProductsLimits.useQuery({
    limit: 3,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>("#1e40af");
  const [showControls, setShowControls] = useState(false);
  const [imageColors, setImageColors] = useState<Map<string, string>>(
    new Map()
  );

  const bannerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<Timeout | null>(null);

  // Efeito para auto-play
  useEffect(() => {
    if (!isAutoPlaying || !banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners]);

  useEffect(() => {
    if (!banners) return;

    const loadImageColors = async () => {
      const newColors = new Map();

      for (const banner of banners) {
        const imageUrl = banner.thumbnail || banner.images[0]?.url;
        if (imageUrl && !imageColors.has(imageUrl)) {
          try {
            const color = await getDominantColor(imageUrl);
            newColors.set(imageUrl, color);
          } catch {
            newColors.set(imageUrl, "#fbbf24");
          }
        }
      }

      if (newColors.size > 0) {
        setImageColors((prev) => new Map([...prev, ...newColors]));
      }
    };

    loadImageColors();
  }, [banners]);

  useEffect(() => {
    if (!banners || banners.length === 0) return;

    const currentBanner = banners[currentSlide];
    const imageUrl = currentBanner.thumbnail || currentBanner.images[0]?.url;

    if (imageUrl && imageColors.has(imageUrl)) {
      const color = imageColors.get(imageUrl);
      setBackgroundColor(color || "#fbbf24");
    }
  }, [currentSlide, banners, imageColors]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "ArrowRight") {
        handleNextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [banners]);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowControls(true);
    setIsAutoPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setIsAutoPlaying(true);
    }, 500);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setShowControls(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setIsAutoPlaying(true);
    }, 2000);
  };

  const handleNextSlide = useCallback(() => {
    if (!banners || banners.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    setShowControls(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setIsAutoPlaying(true);
    }, 2000);
  }, [banners]);

  const handlePrevSlide = useCallback(() => {
    if (!banners || banners.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setShowControls(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setIsAutoPlaying(true);
    }, 2000);
  }, [banners]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !banners) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      handlePrevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <Spinner className="size-9" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full bg-banner px-4 py-16">
        <div className="mx-auto flex h-64 w-full max-w-7xl items-center justify-center rounded-xl bg-white/20">
          <span className="text-banner-foreground">
            Nenhum produto encontrado!
          </span>
        </div>
      </div>
    );
  }

  const banner = banners[currentSlide];

  const discountPercent = banner.comparePrice
    ? Math.round(
        ((banner.comparePrice - banner.price) / banner.comparePrice) * 100
      )
    : 70;

  return (
    <div
      ref={bannerRef}
      className="relative w-full overflow-hidden transition-all duration-500 ease-in-out"
      style={{ backgroundColor }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto relative max-w-7xl h-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between lg:gap-12">
          {/* Left Content */}
          <div className="z-10 flex w-full flex-col items-center gap-6 text-center md:w-1/2 md:items-start md:text-left">
            {/* Logo/Title */}
            <div className="relative">
              <h1 className="font-sans text-2xl font-black uppercase leading-none text-white md:text-5xl lg:text-6xl">
                <span className="relative inline-block">
                  QUEIMA
                  <Flame className="absolute -right-8 -top-2 h-8 w-8 fill-white text-white md:h-10 md:w-10 lg:-right-10 lg:-top-3 lg:h-12 lg:w-12" />
                </span>
              </h1>
              <h2 className="mt-1 font-sans text-xl font-black uppercase leading-none text-white md:text-4xl lg:text-5xl">
                DE <span className="relative inline-block">ESTOQUE</span>
              </h2>
            </div>

            {/* Offer Badges */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {/* Discount Badge */}
              <div className="rounded-full bg-white/95 backdrop-blur-sm px-6 py-3 shadow-lg md:px-8 md:py-4">
                <p className="text-center font-sans text-sm font-bold uppercase text-gray-700 md:text-base">
                  ATÉ{" "}
                  <span className="text-3xl font-black text-gray-900 md:text-4xl lg:text-5xl">
                    {discountPercent}%
                  </span>{" "}
                  OFF
                </p>
              </div>

              {/* Free Shipping Badge */}
              <div className="rounded-full bg-white/95 backdrop-blur-sm px-6 py-3 shadow-lg md:px-8 md:py-4">
                <p className="text-center font-sans text-sm font-bold uppercase text-gray-700 md:text-base">
                  FRETE GRÁTIS
                </p>
                <p className="text-center font-sans text-xs text-gray-600">
                  A PARTIR DE{" "}
                  <span className="rounded bg-gray-900 px-2 py-0.5 font-bold text-white">
                    R$ 119
                  </span>
                </p>
              </div>
            </div>

            {/* Urgency Button - Links to product */}
            <Link href={`/product/${banner.slug}`} className="w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full rounded-full bg-white px-8 py-6 font-sans text-sm font-bold uppercase text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-white/90 md:text-base"
              >
                SÓ ATÉ 26 DE OUTUBRO, APROVEITE!
              </Button>
            </Link>

            {/* Disclaimer */}
            <div className="">
              <p className="text-xs text-white/90 md:text-sm">
                *Confira condições - em produtos com frete grátis.
              </p>
              <p className="text-xs text-white/90 md:text-sm">
                Ver mais em Queima de Estoque.
              </p>
            </div>
          </div>

          {/* Right Image - Product Image */}
          <Link
            href={`/product/${banner.slug}`}
            className="relative z-10 w-full md:w-1/2"
          >
            <div className="relative rounded-md mx-auto h-[400px] w-full max-w-md md:max-w-none">
              <Image
                src={
                  banner.thumbnail ||
                  banner.images[0]?.url ||
                  "/placeholder.svg?height=600&width=450"
                }
                alt={banner.images[0]?.altText || banner.title}
                fill
                className="object-contain rounded-md w-full h-full"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div
            className={`
            absolute bottom-4 left-1/2 z-20 flex  -translate-x-1/2 transform gap-2
            transition-all duration-300 ease-in-out
          `}
          >
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    index === currentSlide
                      ? "w-8 dark:bg-white bg-blue-500"
                      : "w-2 dark:bg-white/40 bg-black hover:bg-white/60"
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <div
          className={`
            absolute inset-x-0  top-1/3 z-20 flex -translate-y-1/2 transform items-center justify-between
            transition-all duration-300 ease-in-out
            ${showControls ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
        >
          {/* Previous Button */}
          <button
            onClick={handlePrevSlide}
            className="rounded-r-full cursor-pointer bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextSlide}
            className="rounded-l-full cursor-pointer bg-white/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black/100 to-transparent pointer-events-none" />
    </div>
  );
}
