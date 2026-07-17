import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

import { ProviderTema } from "@/components/provider-tema";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "GestionaleAssicurativo",
    template: "%s | GestionaleAssicurativo",
  },
  description: "Gestionale semplice per le scadenze delle polizze assicurative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ProviderTema>
          {children}
          <Toaster position="top-center" richColors />
        </ProviderTema>
        <Script id="inizializza-tema" strategy="beforeInteractive">
          {`try {
            const tema = localStorage.getItem("gestionale-assicurativo-tema");
            const modalitaScura = tema !== "light";
            document.documentElement.classList.toggle("dark", modalitaScura);
            document.documentElement.style.colorScheme = modalitaScura ? "dark" : "light";
          } catch {}`}
        </Script>
      </body>
    </html>
  );
}
