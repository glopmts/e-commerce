import { PaymentMethodEnum } from "@prisma/client";

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

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Reviews {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  isApproved: boolean;
  productId: string;
}
[];

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  typePayment: PaymentMethodEnum;
  description?: string | null;
  icon: string;
}
