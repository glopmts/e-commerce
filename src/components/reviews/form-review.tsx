"use client";

import { ImageUpIcon, Star, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Label } from "recharts";
import { User } from "../../types/interfaces";
import { useUploadThing } from "../../utils/uploadthing";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

type FormReviewProps = {
  user: User;
  review?: {
    rating: number;
    comment: string | null;
    images: string[] | null;
  };
  onSubmit?: (data: {
    rating: number;
    comment: string;
    images: string[];
  }) => void;
  imageUrlProduct?: string | null;
  nameProduct?: string | null;
  isCreating?: boolean;
  isDeleting?: boolean;
  type?: "create" | "edit";
};

const FormReview = ({
  user,
  review,
  isDeleting,
  isCreating,
  imageUrlProduct,
  nameProduct,
  onSubmit,
}: FormReviewProps) => {
  const [form, setForm] = useState({
    rating: review ? review.rating : 0,
    comment: review ? review.comment || "" : "",
    images: review ? review.images || [] : [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { startUpload, isUploading } = useUploadThing("imageReview", {
    onClientUploadComplete: (res) => {
      if (res) {
        const uploadedUrls = res.map((file) => file.url);
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        setUploadProgress(0);
      }
      setIsLoading(false);
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setIsLoading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    if (files.length + form.images.length > 4) {
      alert("Você pode enviar no máximo 4 imagens.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    const invalidSizeFiles: string[] = [];
    const invalidTypeFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_SIZE) invalidSizeFiles.push(file.name);
      if (!allowedTypes.includes(file.type)) invalidTypeFiles.push(file.name);
    }

    if (invalidSizeFiles.length > 0 || invalidTypeFiles.length > 0) {
      let msg = "";
      if (invalidSizeFiles.length > 0) {
        msg += `Os seguintes arquivos excedem 10MB: ${invalidSizeFiles.join(
          ", "
        )}. `;
      }
      if (invalidTypeFiles.length > 0) {
        msg += `Tipos inválidos: ${invalidTypeFiles.join(
          ", "
        )}. Tipos permitidos: png, jpg, jpeg, webp, gif, avif.`;
      }
      alert(msg);
      return;
    }

    setIsLoading(true);

    try {
      await startUpload(Array.from(files));
    } catch (error) {
      console.error("Upload failed:", error);
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDeleteImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(form);
    }
  };

  const totalLoading = isLoading || isUploading || isCreating || isDeleting;

  return (
    <div className="border p-4 rounded-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center pb-6">
          <Star className="mr-2 h-4 w-4" />
          <span>Deixe uma avaliação deste produto!!</span>
        </div>
      </div>
      <div className="w-full">
        <div className="w-full h-auto">
          <div className="flex gap-1.5">
            {imageUrlProduct && (
              <Image
                src={imageUrlProduct}
                alt={nameProduct || ""}
                sizes="100vw"
                width={60}
                height={60}
                className="rounded-md"
              />
            )}
            <span className="font-medium">{nameProduct}</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-col gap-1.5">
            <Label className="font-medium">Sua Avaliação</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 cursor-pointer ${
                    form.rating >= star ? "text-yellow-500" : "text-gray-300"
                  }`}
                  onClick={() => setForm({ ...form, rating: star })}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2.5 w-full">
            <div className="mt-4 flex flex-col gap-2 w-full">
              <Label className="font-medium">Comentário</Label>
              <Textarea
                className="w-full rounded-md border p-2"
                value={form.comment}
                placeholder="Deixe um comentario"
                maxLength={300}
                minLength={5}
                disabled={totalLoading}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
            </div>
            <div className="mt-6">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={totalLoading}
                className="hidden"
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outline"
                  size="icon-lg"
                  title="Enviar imagens"
                  disabled={totalLoading}
                  type="button"
                  asChild
                >
                  <div>
                    {totalLoading ? <Spinner /> : <ImageUpIcon size={20} />}
                  </div>
                </Button>
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          {totalLoading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enviando... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Preview das Imagens */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {form.images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <Image
                  src={imageUrl}
                  alt={`Imagem da avaliação ${index + 1}`}
                  className="rounded-md object-cover"
                  width={100}
                  height={100}
                  sizes="100vw"
                />
                <div className="absolute top-0 left-0 transition-all rounded-md flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => handleDeleteImage(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Submit */}
          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={
                totalLoading || form.rating === 0 || form.comment.length < 10
              }
              className="w-full"
            >
              {totalLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar Avaliação"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormReview;
