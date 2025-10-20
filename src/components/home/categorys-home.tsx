"use client";

import Image from "next/image";
import Link from "next/link";
import { trpc } from "../../server/trpc/client";
import { Spinner } from "../ui/spinner";

const CategoryHome = () => {
  const {
    data: categories,
    isLoading,
    error,
  } = trpc.category.getCategories.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <Spinner className="size-9" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <p className="text-red-500">Failed to load categories</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 ">
      <div className="pb-8">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
          Categorias
        </h2>
        <p className="text-muted-foreground mt-2">
          Explore nossas categorias de produtos
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {categories?.map((category) => (
          <Link
            href={`/category/${category.slug}`}
            key={category.id}
            className="group"
          >
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-muted ring-2 ring-border group-hover:ring-primary transition-all duration-300">
                {category.image ? (
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 96px, 112px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-3xl lg:text-4xl opacity-30">📦</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-sm lg:text-base group-hover:text-primary transition-colors line-clamp-2">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryHome;
