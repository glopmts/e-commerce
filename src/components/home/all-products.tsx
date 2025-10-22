"use client";

import { trpc } from "../../server/trpc/client";
import { Product } from "../../types/interfaces";
import CardProduct from "../card-product";
import { Spinner } from "../ui/spinner";

const AllProducts = () => {
  const {
    data: productsData,
    isLoading,
    error,
  } = trpc.product.getProducts.useQuery({
    limit: 16,
    page: 1,
  });
  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery();
  const userId = user?.id as string;

  const products = productsData?.products || [];

  if (isLoading || loaderUser) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <Spinner className="size-9" />
      </div>
    );
  }

  return (
    <div className="w-full h-full left-0 p-4">
      <div className="pb-6">
        <h2 className="text-2xl font-bold">Produtos</h2>
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

export default AllProducts;
