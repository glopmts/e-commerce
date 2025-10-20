export interface Images {
  id: string;
  createdAt: Date | string;
  url: string;
  productId: string;
  sortOrder: number;
  altText: string | null;
  isPrimary: boolean;
}
[];

export interface Category {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
  description: string | null;
  slug: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  stock: number;
  comparePrice: number | null;
  slug: string;
  costPrice: number | null;
  barcode: string | null;
  weight: number | null;
  height: number | null;
  width: number | null;
  depth: number | null;
  content: string;
  trackStock: boolean;
  thumbnail: string | null;
  images: Images[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
