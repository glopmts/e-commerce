"use client";

import axios, { type AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { PixRequest, PixResponse, PixItem } from "../types/pix-interfaces";

export type PaymentStatusResponse = {
  status: "pending" | "approved" | "rejected";
  error?: string;
};

// Constants
const PIX_EXPIRATION_MINUTES = 30;
const MAX_RETRIES = 3;

// Service
const mercadoPagoService = {
  async createPixQrcode(data: PixRequest): Promise<{ data: PixResponse }> {
    const response = await axios.post("/api/payments/mercado-pago/pix", data);
    return response;
  },

  async checkPaymentStatus(
    paymentId: string
  ): Promise<{ data: PaymentStatusResponse }> {
    const response = await axios.get(
      `/api/payments/mercado-pago/status/${paymentId}`
    );
    return response;
  },
};

// Hook Unificado
export const usePixPayment = () => {
  const router = useRouter();
  // CORREÇÃO: Adicionar ref para controlar requisições em andamento
  const pendingRequestRef = useRef<string | null>(null);

  const handleGeneratePix = useCallback(
    async (
      items: PixItem[],
      total: number,
      userId: string,
      email: string | null,
      retryCount: number,
      paymentMethodId: string,
      shippingAddressId: string,
      type: "single" | "cart",
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
        setError("Nenhum item encontrado para pagamento");
        return;
      }

      if (retryCount >= MAX_RETRIES) {
        setError("Número máximo de tentativas atingido");
        return;
      }

      // CORREÇÃO: Verificar se já existe uma requisição em andamento
      const requestKey = `${userId}-${items
        .map((i) => i.id)
        .join("-")}-${total}`;
      if (pendingRequestRef.current === requestKey) {
        console.log("Requisição duplicada detectada, ignorando...");
        return;
      }

      // CORREÇÃO: Marcar requisição como em andamento
      pendingRequestRef.current = requestKey;
      setIsProcessing(true);
      setError(null);

      try {
        console.log("Criando pagamento PIX no Mercado Pago...", {
          itemsCount: items.length,
          total,
          userId,
        });

        const requestData: PixRequest = {
          items: items,
          total,
          userId,
          paymentMethodId,
          shippingAddressId,
          email: email || "",
          type,
        };

        const response = await mercadoPagoService.createPixQrcode(requestData);
        const { data: responseData } = response;

        console.log("Pagamento PIX criado com sucesso:", {
          paymentId: responseData.id,
          status: responseData.status,
        });

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

        console.error("Erro ao criar pagamento PIX:", errorMessage);
        setError(errorMessage);
        toast.error(`Erro no PIX: ${errorMessage}`);
        setRetryCount((prev) => prev + 1);
      } finally {
        setIsProcessing(false);
        // CORREÇÃO: Limpar referência da requisição
        pendingRequestRef.current = null;
      }
    },
    []
  );

  // Função unificada que detecta automaticamente o tipo
  const handleGeneratePixUnified = useCallback(
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
      const type = items.length === 1 ? "single" : "cart";

      await handleGeneratePix(
        items,
        total,
        userId,
        email,
        retryCount,
        paymentMethodId,
        shippingAddressId,
        type,
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

          const successParams = new URLSearchParams();
          successParams.append("paymentId", paymentId);

          setTimeout(
            () => router.push(`/payment/success?${successParams.toString()}`),
            2000
          );
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
    handleGeneratePix: handleGeneratePixUnified,
    checkPaymentStatus,
  };
};