export type RawItem = {
  thumbnail?: string | null;
  id: string;
  title?: string;
  price?: number;
  stock?: number | null;
  product?: {
    id: string;
    title: string;
    price: number;
    stock: number | null;
    thumbnail?: string | null;
  };
};
