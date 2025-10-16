"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useProductSearch } from "@/hooks/useProductSearch";
import { cn } from "@/lib/utils";
import { Loader2, SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SearchResult {
  id: string;
  name: string;
  category: string;
}

interface SearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

const Search = ({
  className,
  placeholder = "Buscar produtos, marcas e muito mais...",
  onSearch,
  onResultSelect,
  autoFocus = false,
  disabled = false,
}: SearchProps) => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { results, isLoading, search } = useProductSearch();

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      search(debouncedQuery);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleResultClick = (result: any) => {
    setQuery(result.title);
    setShowResults(false);
    onResultSelect?.({
      id: result.id,
      name: result.title,
      category: result.category?.name || "Geral",
    });
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (results.length > 0 && query.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
    onSearch?.("");
    inputRef.current?.focus();
  };

  const formattedResults = results.map((product) => ({
    id: product.id,
    name: product.title,
    category: product.category?.name || "Geral",
    product,
  }));

  return (
    <div className={cn("w-full relative", className)}>
      <div className="relative">
        <Button
          variant="ghost"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          <SearchIcon className="h-4 w-4 dark:text-black" />
        </Button>

        <Input
          ref={inputRef}
          className={cn(
            "pl-10 bg-amber-50 dark:bg-white text-black",
            isLoading && "pr-12"
          )}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoFocus={autoFocus}
          disabled={disabled}
        />

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4  animate-spin" />
        )}

        {query && !isLoading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute left-3 top-1/3 transform -translate-y-1/2 h-4  text-black w-4 hover:text-zinc-400"
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showResults && formattedResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
          {formattedResults.map((result) => (
            <button
              key={result.id}
              className="w-full px-4 py-2 text-left hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
              onClick={() => handleResultClick(result.product)}
              type="button"
            >
              <div className="font-medium">{result.name}</div>
              <div className="text-sm text-muted-foreground">
                {result.category}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {showResults &&
        debouncedQuery &&
        formattedResults.length === 0 &&
        !isLoading && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg mt-1 z-50 p-4 text-center ">
            Nenhum resultado encontrado para "{debouncedQuery}"
          </div>
        )}
    </div>
  );
};

export default Search;
