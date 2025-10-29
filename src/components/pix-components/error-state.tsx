"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isProcessing: boolean;
  retryCount: number;
}

export function ErrorState({
  error,
  onRetry,
  isProcessing,
  retryCount,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <div className="text-center">
        <h3 className="font-semibold text-red-700 mb-2">Erro ao gerar PIX</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button
          onClick={onRetry}
          disabled={isProcessing}
          variant="outline"
          className="gap-2 bg-transparent"
        >
          <RefreshCw
            className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`}
          />
          Tentar Novamente {retryCount > 0 && `(${retryCount})`}
        </Button>
      </div>
    </div>
  );
}
