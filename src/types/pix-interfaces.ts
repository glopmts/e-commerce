export type PixItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  shippingAddressId?: string;
  paymentMethodId?: string;
};

export type PixRequest = {
  items: PixItem[];
  total: number;
  userId: string;
  email: string;
  shippingAddressId: string;
  paymentMethodId: string;
  type: "single" | "cart";
};

export type PixResponse = {
  qr_code_base64: string;
  qr_code: string;
  id: string;
  status: string;
  message?: string;
};

export type Item = {
  id: string;
  price?: number;
  quantity?: number;
  title?: string;
  product: {
    id: string;
    title: string;
    price: number;
    stock: number | null;
  };
};

export interface OrderSummaryProps {
  item?: PixItem | null;
  items?: PixItem[] | null;
  subtotal: number;
  total: number;
  type?: "single" | "cart";
}

export interface PaymentStatusProps {
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
  paymentId?: string;
}

export interface PaymentStatusIndicatorProps {
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
  timeLeft: number;
}
