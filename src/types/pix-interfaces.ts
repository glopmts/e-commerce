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
  item?: Item | null;
  items?: Item[] | null;
  subtotal: number;
  total: number;
}

export interface PaymentStatusProps {
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
  paymentId?: string;
}

export interface PaymentStatusIndicatorProps {
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
  timeLeft: number;
}
