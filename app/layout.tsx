import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orion Technology | Agencia de Desarrollo de Software",
  description: "Especialistas en desarrollo de software a medida, aplicaciones móviles e inteligencia artificial. Elevamos tu visión al futuro digital.",
  keywords: ["desarrollo de software", "aplicaciones móviles", "inteligencia artificial", "Orion Technology"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={outfit.className}>
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
