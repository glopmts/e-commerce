import { PixItem } from "../services/use-pix-payment.service";

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
  type: "single" | "cart";
}

export interface PaymentStatusProps {
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
  paymentId?: string;
}

export interface PaymentStatusIndicatorProps {
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
  timeLeft: number;
}
