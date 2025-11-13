"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      title: string;
      slug: string;
      price: number;
      stock: number;
      thumbnail: string | null;
      images?: { url: string }[] | null;
    };
  };
  isUpdating: boolean;
  isSelected: boolean;
  onSelect: (itemId: string, selected: boolean) => void;
  onAddQuantity: (productId: string, currentQuantity: number) => void;
  onRemoveQuantity: (
    productId: string,
    currentQuantity: number,
    cartItemId: string
  ) => void;
  onRemoveItem: (cartItemId: string) => void;
}

export function CartItem({
  item,
  isUpdating,
  isSelected,
  onSelect,
  onAddQuantity,
  onRemoveQuantity,
  onRemoveItem,
}: CartItemProps) {
  const canAddMore = item.product.stock > item.quantity;

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onSelect(item.id, checked === true);
  };

  return (
    <Card className="w-full">
      <CardContent className="flex items-center relative gap-4 p-4">
        {/* Checkbox de seleção*/}
        <div className="flex items-start">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
        </div>

        {/* Imagem do produto */}
        <Link href={`/product/${item.product.slug}`} className="shrink-0">
          <div className="w-40 h-40 relative">
            <Image
              src={
                item.product.thumbnail ||
                item.product.images?.[0]?.url ||
                "/placeholder.svg"
              }
              alt={item.product.title}
              fill
              sizes="160px"
              quality={90}
              className="rounded-md object-cover hover:opacity-75 transition-opacity"
            />
          </div>
        </Link>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <Link
              href={`/product/${item.product.slug}`}
              className="hover:underline flex-1"
            >
              <h3 className="font-semibold line-clamp-2">
                {item.product.title}
              </h3>
            </Link>

            {/* Botão remover item */}
            <Button
              variant="ghost"
              size="icon"
              disabled={isUpdating}
              onClick={() => onRemoveItem(item.id)}
              className="h-8 w-8 shrink-0"
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-col">
              <span className="text-base font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.product.price)}
              </span>

              {/* Controles de quantidade */}
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  disabled={isUpdating || item.quantity <= 1}
                  onClick={() =>
                    onRemoveQuantity(item.productId, item.quantity, item.id)
                  }
                >
                  <Minus size={14} />
                </Button>

                <span className="text-sm font-medium min-w-8 text-center">
                  {item.quantity}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  disabled={isUpdating || !canAddMore}
                  onClick={() => onAddQuantity(item.productId, item.quantity)}
                >
                  <Plus size={14} />
                </Button>
              </div>

              <Badge variant="outline" className="text-xs mt-3 w-fit">
                Estoque: {item.product.stock}
              </Badge>
            </div>

            <div className="text-right">
              <span className="font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.product.price * item.quantity)}
              </span>
              {isSelected && (
                <div className="text-xs text-green-600 mt-1">Selecionado</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
