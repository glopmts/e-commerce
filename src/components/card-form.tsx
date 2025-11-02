"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CreditCard, Lock } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CardFormProps {
  onSubmit: (cardData: {
    cardNumber: string;
    holderName: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    brand: string;
  }) => void;
  loading?: boolean;
}

const cardBrandLogos: Record<string, string> = {
  visa: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png",
  mastercard:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png",
  amex: "https://www.americanexpress.com/content/dam/amex/pt-br/network/images/card-art/Cartoes_Recortados_OK/The-Platinum-Card_480x307.png",
  elo: "https://neofeed.com.br/wp-content/uploads/2021/04/Elo-1-1200x900.jpg",
  hipercard:
    "https://play-lh.googleusercontent.com/JVtAPSiGLeOdZXVzzCGoUeh6I0x_7L19cNeQNAwbadxQPvxX3KYnpVXmVeHlbiPkZZI=w600-h300-pc0xffffff-pd",
};

export function CardForm({ onSubmit, loading }: CardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [brand, setBrand] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    const debounce = setTimeout(() => {
      const cleaned = cardNumber.replace(/\s/g, "");
      if (cleaned.length >= 6) {
        (async () => {
          try {
            const response = await fetch(
              "/api/payments/mercado-pago/card/detect-brand",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cardNumber: cleaned }),
                signal: controller.signal,
              }
            );

            if (!response.ok) {
              setBrand("");
              return;
            }

            const data = await response.json();
            if (data?.isValid) {
              setBrand(data.brand || "");
            } else {
              setBrand("");
            }
          } catch (error: any) {
            if (error.name === "AbortError") return;
            console.error("Error detecting brand:", error);
          }
        })();
      } else {
        setBrand("");
      }
    }, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [cardNumber]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = "Número do cartão inválido";
    }

    if (holderName.length < 3) {
      newErrors.holderName = "Nome do titular inválido";
    }

    const [month, year] = expiryDate.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (
      !month ||
      !year ||
      Number.parseInt(month) < 1 ||
      Number.parseInt(month) > 12
    ) {
      newErrors.expiryDate = "Data de validade inválida";
    } else if (
      Number.parseInt(year) < currentYear ||
      (Number.parseInt(year) === currentYear &&
        Number.parseInt(month) < currentMonth)
    ) {
      newErrors.expiryDate = "Cartão expirado";
    }

    if (cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const [month, year] = expiryDate.split("/");
    const fullYear = 2000 + Number.parseInt(year);

    onSubmit({
      cardNumber: cardNumber.replace(/\s/g, ""),
      holderName,
      expiryMonth: Number.parseInt(month),
      expiryYear: fullYear,
      cvv,
      brand: brand || "unknown",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
          {brand && (
            <div className="w-10 h-10 relative overflow-hidden">
              <Image
                src={cardBrandLogos[brand] || "💳"}
                alt="logo card"
                sizes="100vw"
                className="w-full h-full object-contain"
                fill
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-lg font-mono tracking-wider">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-muted-foreground">Titular</div>
              <div className="font-medium">
                {holderName || "NOME DO TITULAR"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Validade</div>
              <div className="font-medium">{expiryDate || "MM/AA"}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Número do Cartão</Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={handleCardNumberChange}
            className={cn(errors.cardNumber && "border-destructive")}
          />
          {errors.cardNumber && (
            <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div>
          <Label htmlFor="holderName">Nome do Titular</Label>
          <Input
            id="holderName"
            type="text"
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value.toUpperCase())}
            className={cn(errors.holderName && "border-destructive")}
          />
          {errors.holderName && (
            <p className="text-sm text-destructive mt-1">{errors.holderName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Validade</Label>
            <Input
              id="expiryDate"
              type="text"
              placeholder="MM/AA"
              value={expiryDate}
              onChange={handleExpiryChange}
              className={cn(errors.expiryDate && "border-destructive")}
            />
            {errors.expiryDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.expiryDate}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              placeholder="123"
              value={cvv}
              onChange={handleCvvChange}
              className={cn(errors.cvv && "border-destructive")}
            />
            {errors.cvv && (
              <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Seus dados estão protegidos e criptografados</span>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processando..." : "Salvar Cartão"}
        </Button>
      </div>
    </form>
  );
}
