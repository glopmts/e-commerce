import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Header from "../components/header/Header";
import { ThemeProvider } from "../components/theme-provider";
import { SessionProvider } from "../hooks/use-session";
import { UploadThingProvider } from "../providers/uploadthing";
import "./globals.css";
import { TRPCProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
                <main className="w-full min-h-svh h-full">
                  <Header />
                  {children}
                </main>
              </UploadThingProvider>
            </SessionProvider>
            <Toaster />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
