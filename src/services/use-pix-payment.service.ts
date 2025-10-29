"use client";

import axios, { type AxiosError, type AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

// Types
type PixItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  shippingAddressId?: string;
  paymentMethodId?: string;
};

type PixRequest = {
  items?: PixItem[];
  item?: PixItem;
  total: number;
  userId: string;
  email: string;
  shippingAddressId: string;
  paymentMethodId: string;
};

type PixResponse = {
  qr_code_base64: string;
  qr_code: string;
  id: string;
  status: string;
  message?: string;
};

type PaymentStatusResponse = {
  status: "pending" | "approved" | "rejected";
  error?: string;
};

// Constants
const PIX_EXPIRATION_MINUTES = 30;
const MAX_RETRIES = 3;

// Service
const mercadoPagoService = {
  async createPixQrcode(data: PixRequest): Promise<AxiosResponse<PixResponse>> {
    return axios.post("/api/payments/mercado-pago", data);
  },

  async checkPaymentStatus(
    paymentId: string
  ): Promise<AxiosResponse<PaymentStatusResponse>> {
    return axios.get(`/api/payments/mercado-pago/status/${paymentId}`);
  },
};

// Hook
export const usePixPayment = () => {
  const router = useRouter();

  const handleGeneratePix = useCallback(
    async (
      items: PixItem[],
      total: number,
      userId: string,
      email: string | null,
      retryCount: number,
      paymentMethodId: string,
      shippingAddressId: string,
      setError: (error: string | null) => void,
      setIsProcessing: (processing: boolean) => void,
      setPixData: (data: {
        qrCodeBase64: string;
        qrCode: string;
        paymentId: string;
        status: string;
      }) => void,
      setExpirationTime: (date: Date) => void,
      setRetryCount: (count: number | ((prev: number) => number)) => void
    ) => {
      if (!items || items.length === 0) {
        setError("Carrinho vazio");
        return;
      }

      if (retryCount >= MAX_RETRIES) {
        setError("Número máximo de tentativas atingido");
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const requestData: PixRequest = {
          items: items,
          total,
          userId,
          paymentMethodId,
          shippingAddressId,
          email: email || "",
        };

        // Para compatibilidade com chamadas antigas que esperam um único item
        if (items.length === 1) {
          requestData.item = items[0];
        }

        const response = await mercadoPagoService.createPixQrcode(requestData);
        const { data: responseData } = response;

        setPixData({
          qrCodeBase64: responseData.qr_code_base64,
          qrCode: responseData.qr_code,
          paymentId: responseData.id,
          status: responseData.status,
        });

        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + PIX_EXPIRATION_MINUTES);
        setExpirationTime(expiration);

        toast.success("PIX gerado com sucesso!");
      } catch (error) {
        const axiosError = error as AxiosError<{
          error: string;
          message?: string;
        }>;
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Erro desconhecido ao gerar pagamento PIX";

        setError(errorMessage);
        toast.error(`Erro no PIX: ${errorMessage}`);
        setRetryCount((prev) => prev + 1);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Função simplificada para item único
  const handleGenerateSinglePix = useCallback(
    async (
      item: PixItem | null,
      total: number,
      userId: string,
      email: string | null,
      retryCount: number,
      setError: (error: string | null) => void,
      setIsProcessing: (processing: boolean) => void,
      setPixData: (data: {
        qrCodeBase64: string;
        qrCode: string;
        paymentId: string;
        status: string;
      }) => void,
      setExpirationTime: (date: Date) => void,
      setRetryCount: (count: number | ((prev: number) => number)) => void
    ) => {
      if (!item) {
        setError("Item não especificado");
        return;
      }

      const shippingAddressId = item.shippingAddressId || "";
      const paymentMethodId = item.paymentMethodId || "";

      await handleGeneratePix(
        [item],
        total,
        userId,
        email,
        retryCount,
        paymentMethodId,
        shippingAddressId,
        setError,
        setIsProcessing,
        setPixData,
        setExpirationTime,
        setRetryCount
      );
    },
    [handleGeneratePix]
  );

  const checkPaymentStatus = useCallback(
    async (
      paymentId: string,
      currentPaymentStatus: string,
      setPaymentStatus: (
        status: "pending" | "approved" | "rejected" | "expired"
      ) => void
    ) => {
      if (!paymentId || currentPaymentStatus !== "pending") return;

      try {
        const response = await mercadoPagoService.checkPaymentStatus(paymentId);
        const { data } = response;

        if (data.status === "approved") {
          setPaymentStatus("approved");
          toast.success("Pagamento aprovado! Redirecionando...");
          setTimeout(() => router.push("/checkout/success"), 2000);
        } else if (data.status === "rejected") {
          setPaymentStatus("rejected");
          toast.error("Pagamento rejeitado");
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ error: string }>;
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Erro ao verificar status";

        console.error("Erro ao verificar status do pagamento:", errorMessage);
      }
    },
    [router]
  );

  return {
    handleGeneratePix,
    handleGenerateSinglePix,
    checkPaymentStatus,
  };
};
