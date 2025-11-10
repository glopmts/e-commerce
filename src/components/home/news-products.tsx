"use client";

import { trpc } from "../../server/trpc/client";
import { Product } from "../../types/interfaces";
import CardProduct from "../card-product";
import { CardsGridSkeleton, ProductCardSkeleton } from "../fallback";
import Title from "../TitleComponent";
import { Spinner } from "../ui/spinner";

const NewsProducts = () => {
  const {
    data: productsData,
    isLoading,
    error,
  } = trpc.product.getProducts.useQuery({
    limit: 4,
    page: 1,
  });
  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery();
  const userId = user?.id as string;

  const products = productsData?.products || [];

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <ProductCardSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full h-full left-0 p-4">
      <div className="pb-6">
        <Title>Produtos em Destaque</Title>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <CardProduct
            key={product.id}
            userId={userId}
            product={product as Product}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsProducts;
