"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  stock: number | null;
  isActive: boolean;
}

interface ProductVariantsProps {
  variants: Variant[];
  onVariantChange?: (variant: Variant) => void;
}

export function ProductVariants({
  variants,
  onVariantChange,
}: ProductVariantsProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((v) => v.isActive) || variants[0] || null
  );

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    onVariantChange?.(variant);
  };

  if (variants.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Variantes</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock === 0;

          return (
            <Button
              key={variant.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              disabled={isOutOfStock || !variant.isActive}
              onClick={() => handleVariantSelect(variant)}
              className={cn(
                "relative",
                isOutOfStock && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="flex flex-col items-start gap-0.5">
                <span className="text-xs">{variant.name}</span>
                {variant.price !== selectedVariant?.price && (
                  <span className="text-[10px] opacity-70">
                    {formatCurrency(variant.price || 0)}
                  </span>
                )}
              </span>
              {isOutOfStock && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
                  Esgotado
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
