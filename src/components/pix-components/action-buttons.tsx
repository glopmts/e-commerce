"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionButtonsProps {
  error: string | null;
  onRetry: () => void;
  isProcessing: boolean;
}

export function ActionButtons({
  error,
  onRetry,
  isProcessing,
}: ActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => router.push("/")}
      >
        Voltar à Loja
      </Button>
      {error && (
        <Button
          onClick={onRetry}
          disabled={isProcessing}
          className="w-full gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`}
          />
          Gerar Novo PIX
        </Button>
      )}
    </div>
  );
}
