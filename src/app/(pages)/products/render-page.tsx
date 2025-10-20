"use client";

import ErrorAlert from "@/components/ErrorAlert";
import CardProduct from "@/components/card-product";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc/client";
import { Product } from "@/types/interfaces";
import { useMemo, useState } from "react";

import SelectComponent from "@/components/SelectComponent";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortOrder = "asc" | "desc" | null;

const RenderProduct = () => {
  const [page, setPage] = useState(1);
  const [selectCategory, setSelectCategory] = useState<string | null>(null);
  const [priceSort, setPriceSort] = useState<SortOrder>(null);

  const {
    data: productsData,
    isLoading,
    error,
  } = trpc.product.getProducts.useQuery({
    limit: 16,
    page: page,
    ...(selectCategory && { categoryId: selectCategory }),
  });

  const { data: categories, isLoading: loaderCategories } =
    trpc.category.getCategories.useQuery();
  const { data: user, isLoading: loaderUser } =
    trpc.user.getCurrentUser.useQuery();
  const userId = user?.id as string;

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const totalProducts = pagination?.totalCount || 0;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.currentPage || 1;
  const hasNextPage = pagination?.hasNextPage || false;
  const hasPrevPage = pagination?.hasPrevPage || false;

  const sortedProducts = useMemo(() => {
    if (!priceSort) return products;

    return [...products].sort((a, b) => {
      if (priceSort === "asc") {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }, [products, priceSort]);

  const handleSortByPrice = () => {
    if (priceSort === null) {
      setPriceSort("asc");
    } else if (priceSort === "asc") {
      setPriceSort("desc");
    } else {
      setPriceSort(null);
    }
  };

  const getSortIcon = () => {
    switch (priceSort) {
      case "asc":
        return <ArrowUp className="h-4 w-4" />;
      case "desc":
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (priceSort) {
      case "asc":
        return "Menor preço";
      case "desc":
        return "Maior preço";
      default:
        return "Preço";
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevPage) {
      setPage((prevPage) => Math.max(prevPage - 1, 1));
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handleCategoryChange = (value: string | null) => {
    setSelectCategory(value);
    setPage(1);
  };

  if (isLoading || loaderUser || loaderCategories) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-banner">
        <Spinner className="size-9" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto h-96 p-2">
        <ErrorAlert
          variant="destructive"
          title="Erro ao carregar produtos"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen h-full p-2 mt-3">
      <div className="w-full h-full">
        <div className="pb-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Produtos
            </h1>
            <p className="text-muted-foreground mt-2">
              Explore nossos produtos disponíveis
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="">
              <span>Ordenar por:</span>
            </div>
            <div className="flex items-center gap-2.5">
              <SelectComponent
                onValueChange={(value) =>
                  handleCategoryChange(value === "all" ? null : value)
                }
                value={categories && selectCategory ? selectCategory : "all"}
                options={[
                  { value: "all", label: "Todas as categorias" },
                  ...(categories || []).map((category) => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
              />
              <div className="">
                <Button
                  variant="outline"
                  onClick={handleSortByPrice}
                  className="flex items-center gap-2"
                >
                  {getSortLabel()}
                  {getSortIcon()}
                </Button>
              </div>
            </div>
          </div>

          {priceSort && (
            <div className="flex justify-end mt-2">
              <span className="text-sm text-muted-foreground">
                Ordenado por:{" "}
                {priceSort === "asc" ? "Menor preço" : "Maior preço"}
              </span>
            </div>
          )}
        </div>

        {/* Informações de paginação */}
        <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
          <span>
            Mostrando {sortedProducts.length} de {totalProducts} produtos
          </span>
          <span>
            Página {currentPage} de {totalPages}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
          {sortedProducts.map((product) => (
            <CardProduct
              key={product.id}
              userId={userId}
              product={product as Product}
            />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={handlePreviousPage}
                    className={
                      !hasPrevPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {currentPage > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={() => handlePageClick(1)}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 4 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}

                {pageNumbers.map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={() => handlePageClick(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={() => handlePageClick(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={handleNextPage}
                    className={
                      !hasNextPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenderProduct;
