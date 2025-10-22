import { formatCurrency } from "@/lib/format";
import { DollarSign, Tag, TrendingDown } from "lucide-react";

interface ProductPricingDetailsProps {
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
}

export function ProductPricingDetails({
  price,
  comparePrice,
  costPrice,
}: ProductPricingDetailsProps) {
  const margin =
    costPrice && price > costPrice
      ? Math.round(((price - costPrice) / price) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-semibold">Características do produto</h3>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between rounded-md bg-secondary px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Preço de Venda
            </span>
          </div>
          <span className="text-sm font-bold">{formatCurrency(price)}</span>
        </div>

        {comparePrice && (
          <div className="flex items-center justify-between rounded-md bg-secondary px-4 py-2.5">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Preço Comparativo
              </span>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(comparePrice)}
            </span>
          </div>
        )}

        {costPrice && (
          <div className="flex items-center justify-between rounded-md bg-secondary px-4 py-2.5">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Custo do Produto
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {formatCurrency(costPrice)}
              </span>
              {margin && (
                <span className="text-xs text-muted-foreground">
                  ({margin}% margem)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
