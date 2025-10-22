"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

interface ProductInfoProps {
  title: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  category: {
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  isActive: boolean;
}

export function ProductInfo({
  title,
  description,
  price,
  comparePrice,
  category,
  isFeatured,
  isActive,
}: ProductInfoProps) {
  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Category & Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          {category.name}
        </Badge>
        {isFeatured && (
          <Badge variant="default" className="text-xs">
            Destaque
          </Badge>
        )}
        {!isActive && (
          <Badge variant="destructive" className="text-xs">
            Indisponível
          </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-balance">
        {title}
      </h1>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed text-pretty">
        {description}
      </p>

      {/* Pricing */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold">{formatCurrency(price)}</span>
        {comparePrice && comparePrice > price && (
          <>
            <span className="text-xl text-muted-foreground line-through">
              {formatCurrency(comparePrice)}
            </span>
            <Badge variant="destructive" className="text-sm">
              -{discount}%
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}
