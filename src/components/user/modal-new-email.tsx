"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../server/trpc/client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const NewsEmailUser = ({ email }: { email: string }) => {
  const [isPending, setIsPending] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string>("");

  const requestCodeMutation = trpc.user.requestEmailVerification.useMutation({
    onSuccess: () => {
      setIsCodeSent(true);
      setIsPending(false);
      toast.success("Código enviado para o novo email!");
      setError("");
    },
    onError: (error) => {
      setIsPending(false);
      setError(error.message);
      toast.error("Erro ao enviar código");
    },
  });

  const verifyAndUpdateMutation = trpc.user.verifyAndUpdateEmail.useMutation({
    onSuccess: () => {
      setIsPending(false);
      toast.success("Email atualizado com sucesso!");
      setError("");
      // Fechar o dialog ou resetar o estado
      setIsCodeSent(false);
      setNewEmail("");
      setCode("");
    },
    onError: (error) => {
      setIsPending(false);
      setError(error.message);
      toast.error("Erro ao verificar código");
    },
  });

  const handleRequestCode = async () => {
    if (!newEmail) {
      setError("Por favor, insira um email válido");
      return;
    }

    setIsPending(true);
    setError("");
    requestCodeMutation.mutateAsync({ newEmail });
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Por favor, insira um código válido de 6 dígitos");
      return;
    }

    setIsPending(true);
    setError("");

    const currentEmail = email;

    verifyAndUpdateMutation.mutateAsync({
      currentEmail,
      newEmail,
      code,
    });
  };

  const handleResendCode = () => {
    handleRequestCode();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Alterar email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar um novo email</DialogTitle>
          <DialogDescription>
            {!isCodeSent
              ? "Digite seu novo email para receber um código de verificação"
              : "Digite o código de 6 dígitos que enviamos para seu novo email"}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-full space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isCodeSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Novo Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="seu.novo.email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <Button
                onClick={handleRequestCode}
                disabled={isPending || !newEmail}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  "Enviar Código de Verificação"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Código de Verificação</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={isPending}
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  Digite o código de 6 dígitos que enviamos para {newEmail}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isPending || code.length !== 6}
                  className="flex-1"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar e Atualizar"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isPending}
                >
                  Reenviar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsEmailUser;
