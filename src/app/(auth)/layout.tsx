import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { Button } from "../../components/ui/button";

const LayoutAuth = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side - Image showcase with overlay */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 z-10" />
        <Image
          src="https://horacampinas.com.br/wp-content/uploads/2022/09/31284225-8d42-4d9f-a2b7-7db3639374d7.png"
          sizes="(max-width: 768px) 0vw, (max-width: 1024px) 50vw, 55vw"
          fill
          className="object-cover"
          alt="Authentication background"
          priority
        />
        {/* Decorative overlay content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="max-w-md space-y-4">
            <h2 className="text-4xl font-bold text-white text-balance leading-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-lg text-white/90 text-pretty leading-relaxed">
              Acesse sua conta e continue sua jornada conosco.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth content */}
      <div className="flex-1 flex flex-col relative">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-30">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-accent hover:border-border transition-all shadow-sm"
            asChild
          >
            <Link href="/" title="Voltar página inicial">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Optional footer text */}
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LayoutAuth;
