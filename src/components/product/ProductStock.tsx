import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface ProductStockProps {
  stock: number;
  trackStock: boolean;
}

export function ProductStock({ stock, trackStock }: ProductStockProps) {
  if (!trackStock) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-secondary px-4 py-3">
        <Package className="size-4 text-muted-foreground" />
        <span className="text-sm">Estoque não rastreado</span>
      </div>
    );
  }

  const stockStatus =
    stock === 0
      ? { label: "Esgotado", variant: "destructive" as const }
      : stock < 10
      ? { label: "Estoque baixo", variant: "secondary" as const }
      : { label: "Em estoque", variant: "default" as const };

  return (
    <div className="flex items-center justify-between rounded-md bg-secondary px-4 py-3">
      <div className="flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <span className="text-sm">Disponibilidade</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={stockStatus.variant} className="text-xs">
          {stockStatus.label}
        </Badge>
        <span className="text-sm font-medium">{stock} unidades</span>
      </div>
    </div>
  );
}
