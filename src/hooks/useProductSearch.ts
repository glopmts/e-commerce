import { useCallback, useState } from "react";
import { trpc } from "../server/trpc/client";

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

  return {
    query,
    results: results || [],
    isLoading,
    error,
    search,
    clearSearch,
    refetch,
  };
};
