"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { trpc } from "../../server/trpc/client";
import { Product } from "../../types/interfaces";
import CardProduct from "../card-product";
import Title from "../TitleComponent";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const CategoryProducts = () => {
  const {
    data: products,
    isLoading,
    error,
  } = trpc.category.getProductByIdInput.useQuery({
    slug: "roupas",
    name: "roupas",
  });
  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery();
  const userId = user?.id as string;

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <Spinner className="size-9" />
      </div>
    );
  }

  return (
    <div className="w-full h-full left-0 p-4">
      <div className="pb-6 flex justify-between items-center w-full">
        <Title>Roupas em Destaque</Title>
        <div className="">
          <Button variant="link" asChild>
            <Link href="/category/roupas">
              Ver Todos
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
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

export default CategoryProducts;
