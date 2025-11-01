import { useCallback, useState } from "react";
import { trpc } from "../server/trpc/client";

interface ProductResult {
  id: string;
  title: string;
  category: {
    name: string;
  };
}

interface ProductsResponse {
  products: ProductResult[];
  pagination: any;
}

export const useProductSearch = () => {
  const [query, setQuery] = useState("");

  const {
    data: results,
    isLoading,
    error,
    refetch,
  } = trpc.product.getProducts.useQuery(
    {
      search: query,
      limit: 10,
      isActive: true,
    },
    {
      enabled: query.length > 2,
      staleTime: 5 * 60 * 1000,
    }
  );

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const products = (results as ProductsResponse)?.products || [];

  return {
    query,
    results: products,
    isLoading,
    error,
    search,
    clearSearch,
    refetch,
  };
};
