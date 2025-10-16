"use client";

import { trpc } from "@/server/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Step = "email" | "token" | "success";

const ForgetPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const forgetPasswordMutation = trpc.auth.forgetPassword.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const result = await forgetPasswordMutation.mutateAsync({ email });

      if (result.success) {
        setStep("token");
        setMessage(result.message);
      } else {
        setMessage(result.message || "Erro ao enviar token");
      }
    } catch (error) {
      setMessage("Erro ao solicitar recuperação de senha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const result = await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });

      if (result.success) {
        setStep("success");
        setMessage(result.message);

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setMessage(result.message || "Erro ao redefinir senha");
      }
    } catch (error) {
      setMessage("Token inválido ou expirado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await forgetPasswordMutation.mutateAsync({ email });
      setMessage(result.message || "Token reenviado com sucesso");
    } catch (error) {
      setMessage("Erro ao reenviar token");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold ">
              Senha Redefinida!
            </h2>
            <p className="mt-2 text-center text-sm text-green-600">{message}</p>
            <p className="mt-2 text-center text-sm dark:text-gray-300">
              Redirecionando para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold ">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm dark:text-gray-300">
            {step === "email"
              ? "Digite seu e-mail para receber o token de recuperação"
              : "Digite o token recebido por e-mail e sua nova senha"}
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.includes("sucesso") || message.includes("enviado")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {step === "email" && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestToken}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium  mb-1"
              >
                E-mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Enviando..." : "Enviar Token"}
              </button>
            </div>
          </form>
        )}

        {step === "token" && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium  mb-1"
                >
                  Token de Recuperação
                </label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole o token recebido por e-mail"
                />
                <p className="mt-1 text-xs text-gray-500">
                  O token foi enviado para: <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium  mb-1"
                >
                  Nova Senha
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>

              <Button
                type="button"
                onClick={handleResendToken}
                disabled={isLoading}
                className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reenviar token
              </Button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
