"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useUploadThing } from "@/utils/uploadthing";
import {
  ArrowLeftIcon,
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFileUpload } from "../../hooks/use-file-upload";
import { Cropper } from "../cropper";

type Area = { x: number; y: number; width: number; height: number };

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

interface UploadImageUserProps {
  imageSrc: string;
  onImageChange: (imageUrl: string | null) => void;
}

export default function UploadImageUser({
  imageSrc,
  onImageChange,
}: UploadImageUserProps) {
  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  });

  const { startUpload, isUploading } = useUploadThing("imageProfile");

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(
    imageSrc || null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadingToServer, setIsUploadingToServer] = useState(false);
  const previousFileIdRef = useRef<string | undefined | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const uploadImageToServer = async (blob: Blob): Promise<string | null> => {
    try {
      const file = new File([blob], `profile-image-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const uploadResult = await startUpload([file]);

      if (uploadResult && uploadResult[0]?.url) {
        return uploadResult[0].url;
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      setIsUploadingToServer(true);

      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      const uploadedImageUrl = await uploadImageToServer(croppedBlob);

      if (!uploadedImageUrl) {
        throw new Error("Failed to upload image to server.");
      }

      if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(finalImageUrl);
      }

      setFinalImageUrl(uploadedImageUrl);
      onImageChange(uploadedImageUrl);
      setIsDialogOpen(false);

      removeFile(fileId);
    } catch (error) {
      console.error("Error during apply:", error);
    } finally {
      setIsUploadingToServer(false);
    }
  };

  const handleRemoveFinalImage = async () => {
    if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(finalImageUrl);
    }
    setFinalImageUrl(null);
    onImageChange(null);
  };

  useEffect(() => {
    setFinalImageUrl(imageSrc || null);
  }, [imageSrc]);

  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      if (currentFinalUrl && currentFinalUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  const isLoading = isUploadingToServer || isUploading;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex">
        <button
          className="relative flex size-32 items-center justify-center overflow-hidden rounded-full border border-dashed border-input transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none data-[dragging=true]:bg-accent/50"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={finalImageUrl ? "Change image" : "Upload image"}
          disabled={isLoading}
        >
          {finalImageUrl ? (
            <img
              className="size-full object-cover"
              src={finalImageUrl}
              alt="User avatar"
              width={128}
              height={128}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex flex-col items-center gap-2"
            >
              <CircleUserRoundIcon className="size-8 opacity-60" />
              <span className="text-xs text-muted-foreground">
                Adicionar foto
              </span>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          )}
        </button>

        {finalImageUrl && !isLoading && (
          <Button
            onClick={handleRemoveFinalImage}
            size="icon"
            variant="destructive"
            className="absolute -top-1 -right-1 size-6 rounded-full border-2 border-background shadow-none"
            aria-label="Remove image"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}

        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
          disabled={isLoading}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                  disabled={isLoading}
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Cortar imagem</span>
              </div>
              <Button
                className="-my-1"
                onClick={handleApply}
                disabled={!previewUrl || !croppedAreaPixels || isLoading}
              >
                {isLoading ? "Enviando..." : "Aplicar"}
              </Button>
            </DialogTitle>
          </DialogHeader>

          {previewUrl && (
            <div className="relative overflow-hidden">
              <Cropper.Root
                className="h-96 sm:h-120 w-full relative"
                image={previewUrl}
                zoom={zoom}
                onCropChange={handleCropChange}
                onZoomChange={setZoom}
              >
                <Cropper.CropArea className="z-30" />
                <Cropper.Image />
              </Cropper.Root>

              {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    <span className="text-sm text-muted-foreground">
                      Enviando imagem...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
                disabled={isLoading}
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
