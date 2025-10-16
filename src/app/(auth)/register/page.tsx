import { RegisterForm } from "@/components/auth/register-form";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Começar</h1>
          <p className="text-muted-foreground">
            Crie sua conta para acessar todos os recursos
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
