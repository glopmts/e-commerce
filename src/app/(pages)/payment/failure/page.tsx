"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, RefreshCcw, XCircle } from "lucide-react"
import Link from "next/link"

const ErrorPage = () => {
  const handleRetry = () => {
    // Lógica para tentar novamente o pagamento
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 dark:bg-red-950 p-3">
            <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">Pagamento Não Processado</h1>

        <p className="text-muted-foreground text-lg mb-2">Não foi possível completar sua transação.</p>

        <p className="text-sm text-muted-foreground mb-8">
          Por favor, verifique seus dados de pagamento e tente novamente. Se o problema persistir, entre em contato com
          nosso suporte.
        </p>

        <div className="bg-muted rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-sm text-foreground mb-2">Possíveis causas:</h3>
          <ul className="text-sm text-muted-foreground text-left space-y-1">
            <li>• Saldo insuficiente ou limite excedido</li>
            <li>• Dados do cartão incorretos</li>
            <li>• Transação recusada pelo banco</li>
            <li>• Erro de conexão</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleRetry} size="lg" className="w-full">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/support">Contatar suporte</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ErrorPage
