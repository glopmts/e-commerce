"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export function useMercadoPagoCard() {
  const [mp, setMp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Mercado Pago SDK
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      const mercadoPago = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!,
        {
          locale: "pt-BR",
        }
      );
      setMp(mercadoPago);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createCardToken = async (cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }) => {
    if (!mp) {
      throw new Error("Mercado Pago SDK not loaded");
    }

    setLoading(true);
    setError(null);

    try {
      const token = await mp.createCardToken(cardData);
      setLoading(false);
      return token;
    } catch (err: any) {
      setError(err.message || "Failed to create card token");
      setLoading(false);
      throw err;
    }
  };

  const processCardPayment = async (paymentData: {
    token: string;
    amount: number;
    description: string;
    email: string;
    installments: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/mercado-pago/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || "Payment processing failed");
      setLoading(false);
      throw err;
    }
  };

  const getInstallments = async (amount: number, bin: string) => {
    if (!mp) {
      throw new Error("Mercado Pago SDK not loaded");
    }

    try {
      const installments = await mp.getInstallments({
        amount: amount.toString(),
        bin: bin,
      });
      return installments;
    } catch (err) {
      console.error("Error getting installments:", err);
      return [];
    }
  };

  return {
    mp,
    loading,
    error,
    createCardToken,
    processCardPayment,
    getInstallments,
  };
}
