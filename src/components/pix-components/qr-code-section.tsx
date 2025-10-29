"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, QrCode } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface QRCodeSectionProps {
  pixData: {
    qrCodeBase64: string;
    qrCode: string;
  } | null;
  timeLeft: number;
  paymentStatus: "pending" | "approved" | "rejected" | "expired";
}

export function QRCodeSection({ pixData }: QRCodeSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyPixCode = async () => {
    if (!pixData?.qrCode) return;

    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro ao copiar código PIX");
    }
  };

  if (!pixData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code PIX
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-lg border-2 border-gray-200">
              <Image
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code PIX"
                width={256}
                height={256}
                className="w-64 h-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Código PIX (copiar e colar):
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPixCode}
                  className="gap-2 bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
              <div className="p-3 rounded border text-sm font-mono break-all select-all">
                {pixData.qrCode}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
