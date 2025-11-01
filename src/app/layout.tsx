import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "../components/theme-provider";
import { SessionProvider } from "../hooks/use-session";
import { UploadThingProvider } from "../providers/uploadthing";
import "./globals.css";
import { TRPCProvider } from "./providers";

export const metadata: Metadata = {
  title: "VlopShoop",
  description: "VlopShoop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {" "}
          <TRPCProvider>
            <SessionProvider>
              <UploadThingProvider>
                <main className="w-full min-h-svh h-full">{children}</main>
              </UploadThingProvider>
            </SessionProvider>
            <Toaster />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
