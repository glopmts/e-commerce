import { cn } from "@/lib/utils";
import type React from "react";
import { Spinner } from "./ui/spinner";

// Fallback original com spinner centralizado
const Fallback = () => {
  return (
    <div className="w-full h-screen max-w-7xl mx-auto">
      <div className="flex items-center justify-center w-full h-full">
        <Spinner className="size-8" />
      </div>
    </div>
  );
};

// Skeleton base reutilizável
const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

// Loading de Card simples
const CardSkeleton = () => {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

// Loading de Grid de Cards
const CardsGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full h-full">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

const ClearanceBannerSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden bg-linear-to-br">
      <div className="mx-auto relative max-w-6xl h-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between lg:gap-12">
          {/* Left Content Skeleton */}
          <div className="z-10 flex w-full flex-col items-center gap-6 md:w-1/2 md:items-start">
            {/* Title Skeleton */}
            <div className="space-y-2 w-full max-w-xs">
              <div className="h-10 md:h-16 lg:h-20 w-full bg-white/30 dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="h-8 md:h-14 lg:h-16 w-4/5 bg-white/30 dark:bg-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Badges Skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 w-full">
              {/* Discount Badge */}
              <div className="rounded-full bg-white/40 dark:bg-white/20 backdrop-blur-sm px-6 py-3 md:px-8 md:py-4 animate-pulse">
                <div className="h-12 md:h-14 lg:h-16 w-32 bg-gray-300/50 dark:bg-gray-700/50 rounded" />
              </div>

              {/* Free Shipping Badge */}
              <div className="rounded-full bg-white/40 dark:bg-white/20 backdrop-blur-sm px-6 py-3 md:px-8 md:py-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-300/50 dark:bg-gray-700/50 rounded" />
                  <div className="h-3 w-24 bg-gray-300/50 dark:bg-gray-700/50 rounded" />
                </div>
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="w-full sm:w-auto">
              <div className="h-14 w-full sm:w-80 bg-white/40 dark:bg-white/20 rounded-full animate-pulse" />
            </div>

            {/* Disclaimer Skeleton */}
            <div className="space-y-1">
              <div className="h-3 w-64 bg-white/20 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-52 bg-white/20 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Right Image Skeleton */}
          <div className="relative z-10 w-full md:w-1/2">
            <div className="relative rounded-md mx-auto h-[400px] w-full max-w-md md:max-w-none bg-white/30 dark:bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Dots Indicator Skeleton */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 transform gap-2">
          <div className="h-2 w-8 bg-white/40 dark:bg-white/20 rounded-full animate-pulse" />
          <div className="h-2 w-2 bg-white/30 dark:bg-white/15 rounded-full animate-pulse" />
          <div className="h-2 w-2 bg-white/30 dark:bg-white/15 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black/100 to-transparent pointer-events-none" />
    </div>
  );
};

// Loading de Card de Produto
const ProductCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full md:h-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="rounded-lg border bg-card overflow-hidden h-full"
          key={i}
        >
          <Skeleton className="h-64 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading de Grid de Produtos
const ProductsGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Loading de Perfil de Usuário
const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header do perfil */}
      <div className="flex items-start gap-6">
        <Skeleton className="size-32 rounded-full shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading de Lista de Itens
const ListSkeleton = ({ items = 5 }: { items?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-lg border bg-card"
        >
          <Skeleton className="size-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};

// Loading de Tabela
const TableSkeleton = ({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 border-b p-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b last:border-b-0 p-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading de Página de Compras/Carrinho
const CartSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
      {/* Lista de itens do carrinho */}
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card">
            <Skeleton className="size-24 rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2 mt-2">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Resumo do pedido */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border bg-card p-6 space-y-4 sticky top-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3 py-4 border-y">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
};

// Loading de Página de Detalhes do Produto
const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
      {/* Imagem do produto */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>

      {/* Informações do produto */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-12 rounded-md" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-16 rounded-md" />
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
};

// Loading de Página de Blog/Artigo
const ArticleSkeleton = () => {
  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Imagem destaque */}
      <Skeleton className="aspect-video w-full rounded-lg" />

      {/* Conteúdo */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </div>
    </article>
  );
};

// Loading de Dashboard
const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>

      {/* Tabela de dados */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
};

// Loading de Formulário
const FormSkeleton = ({ fields = 5 }: { fields?: number }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

// Loading de Página Completa
const PageSkeleton = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <CardsGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
};

// Exportações
export {
  ArticleSkeleton,
  CardsGridSkeleton,
  CardSkeleton,
  CartSkeleton,
  DashboardSkeleton,
  Fallback,
  FormSkeleton,
  ListSkeleton,
  PageSkeleton,
  ProductCardSkeleton,
  ProductDetailSkeleton,
  ProductsGridSkeleton,
  ProfileSkeleton,
  Skeleton,
  TableSkeleton,
  ClearanceBannerSkeleton,
};

export default Fallback;
