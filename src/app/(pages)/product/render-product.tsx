"use client";

import PaymentMethods from "@/components/product/PaymentMethods";
import { ProductImageGallery } from "@/components/product/Product-Gallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductAttributes } from "@/components/product/ProductAttributes";
import { ProductContent } from "@/components/product/ProductContent";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPricingDetails } from "@/components/product/ProductPricingDetails";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { ProductStock } from "@/components/product/ProductStock";
import { ProductVariants } from "@/components/product/ProductVariants";
import FormReview from "@/components/reviews/form-review";
import RenderReviews from "@/components/reviews/reviews-render";
import { Separator } from "@/components/ui/separator";
import { useReviews } from "@/hooks/use-reviews";
import { trpc } from "@/server/trpc/client";
import { User } from "@/types/interfaces";
import { useParams } from "next/navigation";
import { PageSkeleton } from "@/components/fallback";

const RenderProduct = () => {
  const { slug } = useParams();
  const {
    data: product,
    isLoading,
    error,
  } = trpc.product.getProductBySlug.useQuery({
    slug: slug as string,
  });

  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery();

  const userId = user?.id as string;
  const {
    reviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
    hasReview,
    isLoadingHasReview,
    canCreateReview,
    isLoadingCanCreate,
    isCreating,
    isDeleting,
    createReview,
    removeReview,
  } = useReviews({ productId: product?.id!, userId });

  // Combine todos os estados de loading
  const isLoadingAll =
    isLoading ||
    loaderUser ||
    isLoadingReviews ||
    isLoadingHasReview ||
    isLoadingCanCreate;

  if (isLoadingAll) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 mt-4 min-h-screen h-full">
        <PageSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-full min-h-screen w-full items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Product Grid */}
        <div className="">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Images */}
            <div className="flex flex-col gap-4">
              <ProductImageGallery
                images={product.images}
                thumbnail={product.thumbnail || ""}
                title={product.title}
              />
              <Separator />
              <ProductPricingDetails
                price={product.price}
                comparePrice={product.comparePrice}
                costPrice={product.costPrice}
              />
              <ProductSpecifications
                width={product.width}
                height={product.height}
                depth={product.depth}
                weight={product.weight}
                barcode={product.barcode}
              />
            </div>

            {/* Right Column - Product Details */}
            <div className="flex flex-col gap-6">
              <ProductInfo
                title={product.title}
                description={product.description}
                price={product.price}
                comparePrice={product.comparePrice}
                category={product.category}
                isFeatured={product.isFeatured}
                isActive={product.isActive}
              />

              <ProductStock
                stock={product.stock}
                trackStock={product.trackStock}
              />

              {product.variants.length > 0 && (
                <ProductVariants variants={product.variants} />
              )}

              <ProductActions
                productId={product.id}
                isActive={product.isActive}
                stock={product.stock}
                userId={userId}
              />

              {product.attributes.length > 0 && (
                <ProductAttributes attributes={product.attributes} />
              )}
              <PaymentMethods />
            </div>
          </div>
          <div className="flex w-full flex-col-reverse  md:flex-row items-baseline md:justify-between gap-8 pt-10">
            {product.content && <ProductContent content={product.content} />}
            <div className=""></div>
          </div>

          {/* SEÇÃO DE REVIEWS - ATUALIZADA */}
          <div className="mt-9">
            {hasReview ? (
              <div className="">
                <RenderReviews
                  reviews={reviews}
                  userId={userId}
                  titleProduct={product.title}
                  handleDelete={removeReview}
                />
              </div>
            ) : canCreateReview ? (
              // Mostra formulário apenas se pode criar review (comprou o produto)
              <FormReview
                user={user as User}
                isCreating={isCreating}
                isDeleting={isDeleting}
                onSubmit={createReview}
                imageUrlProduct={product.thumbnail || null}
                nameProduct={product.title || null}
              />
            ) : (
              // Mensagem para usuários que não compraram o produto
              <div className="text-center p-6 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  Você precisa comprar este produto para deixar uma avaliação.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderProduct;