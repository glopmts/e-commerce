"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, OrderSummaryProps, PixItem } from "@/types/pix-interfaces";

export function OrderSummary({ item, subtotal, total }: OrderSummaryProps) {
  const getItemTitle = (item: PixItem) => {
    return item.name || item.name || "Produto sem nome";
  };

  const getItemPrice = (item: PixItem) => {
    return item.price || item.price || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {item && (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{getItemTitle(item)}</p>
                <p className="text-sm text-muted-foreground">product</p>
              </div>
              <span className="font-medium">R$ {getItemPrice(item)}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}