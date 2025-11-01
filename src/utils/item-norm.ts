import { useMemo } from "react";
import { RawItem } from "../types/payments";

type Item = {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    stock: number | null;
    thumbnail?: string | null;
  };
};

export const normalizeItem = (rawItem: RawItem): Item => {
  if (rawItem.product) {
    return {
      id: rawItem.id,
      product: {
        id: rawItem.product.id,
        title: rawItem.product.title,
        price: rawItem.product.price,
        stock: rawItem.product.stock,
        thumbnail: rawItem.product.thumbnail,
      },
    };
  } else {
    return {
      id: rawItem.id,
      product: {
        id: rawItem.id,
        title: rawItem.title ?? "",
        price: rawItem.price ?? 0,
        stock: rawItem.stock ?? null,
        thumbnail: rawItem?.thumbnail || "",
      },
    };
  }
};

export const useItem = (itemParam?: string | null) =>
  useMemo<Item | null>(
    () => (itemParam ? normalizeItem(JSON.parse(itemParam) as RawItem) : null),
    [itemParam]
  );
