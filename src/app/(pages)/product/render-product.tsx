"use client";

import { ProductImageGallery } from "@/components/product/imagens-details";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductAttributes } from "@/components/product/ProductAttributes";
import { ProductContent } from "@/components/product/ProductContent";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPricingDetails } from "@/components/product/ProductPricingDetails";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { ProductStock } from "@/components/product/ProductStock";
import { ProductVariants } from "@/components/product/ProductVariants";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc/client";
import { useParams } from "next/navigation";
import PaymentMethods from "../../../components/product/PaymentMethods";
import { Separator } from "../../../components/ui/separator";

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

  if (isLoading || loaderUser) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <Spinner className="size-9" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
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
          <div className="flex w-full flex-col-reverse  md:flex-row items-baseline gap-8 pt-10">
            {product.content && <ProductContent content={product.content} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderProduct;
