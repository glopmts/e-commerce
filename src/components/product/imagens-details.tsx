"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { TouchEvent, useEffect, useRef, useState } from "react";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  thumbnail: string;
  title: string;
}

export function ProductImageGallery({
  images,
  thumbnail,
  title,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    images.find((img) => img.isPrimary)?.url || thumbnail
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const allImages =
    images.length > 0
      ? images
      : [
          {
            id: "1",
            url: thumbnail,
            altText: title,
            sortOrder: 1,
            isPrimary: true,
          },
        ];

  useEffect(() => {
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  }, [selectedImage]);

  useEffect(() => {
    const index = allImages.findIndex((img) => img.url === selectedImage);
    setSelectedImageIndex(index >= 0 ? index : 0);
  }, [selectedImage, allImages]);

  // Handlers para zoom no desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !isZoomed) return;

    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  // Handlers para swipe no mobile
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      previousImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navegação entre imagens
  const nextImage = () => {
    const nextIndex = (selectedImageIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex].url);
    setSelectedImageIndex(nextIndex);
  };

  const previousImage = () => {
    const prevIndex =
      (selectedImageIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex].url);
    setSelectedImageIndex(prevIndex);
  };

  const selectImage = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setSelectedImageIndex(index);
  };

  // Fullscreen handlers
  const openFullscreen = () => {
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "unset";
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  // Keyboard navigation no fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowLeft") previousImage();
      if (e.key === "ArrowRight") nextImage();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, selectedImageIndex, allImages.length]);

  // Click outside para fechar fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        fullscreenRef.current &&
        !fullscreenRef.current.contains(e.target as Node)
      ) {
        closeFullscreen();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFullscreen]);

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row w-full gap-4">
        {/* Thumbnail Grid */}
        {allImages.length > 1 && (
          <div className="flex md:flex-col items-center gap-2 overflow-x-auto md:overflow-visible">
            {allImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => selectImage(image.url, index)}
                className={cn(
                  "relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all hover:border-primary",
                  selectedImage === image.url
                    ? "border-blue-500 border-2"
                    : "border-gray-300"
                )}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.altText || title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
          <div
            ref={mainImageRef}
            className="relative w-full h-full cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={openFullscreen}
          >
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt={title}
              fill
              className={cn(
                "object-contain transition-transform duration-200",
                isZoomed && "scale-150"
              )}
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div
              className={cn(
                "absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-md transition-opacity duration-200",
                isZoomed ? "opacity-0" : "opacity-100"
              )}
            >
              <ZoomIn size={20} />
            </div>

            {/* Indicador de swipe para mobile */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
              <div className="flex gap-1">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === selectedImageIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navegação entre imagens */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all md:block hidden"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all md:block hidden"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div
            ref={fullscreenRef}
            className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center"
          >
            {/* Botão fechar */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={24} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt={title}
                width={1200}
                height={1200}
                className="object-contain max-w-full max-h-full"
                priority
              />
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight size={32} />
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => selectImage(allImages[index].url, index)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-all",
                          index === selectedImageIndex
                            ? "bg-white"
                            : "bg-white bg-opacity-50 hover:bg-opacity-70"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Contador */}
                <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
