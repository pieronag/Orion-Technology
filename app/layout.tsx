import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.oriontechnology.cl'),
  title: {
    default: "Orion Technology | Desarrollo de Software a Medida e Inteligencia Artificial",
    template: "%s | Orion Technology"
  },
  description: "Agencia especializada en desarrollo de software a medida, sistemas ERP corporativos, aplicaciones móviles e inteligencia artificial. Transforma tu empresa hacia el futuro digital.",
  keywords: [
    "desarrollo de software a medida", "fábrica de software Chile", "desarrollo web corporativo", 
    "creación de aplicaciones móviles", "SaaS a medida", "desarrollo Next.js", "agencia tecnológica",
    "inteligencia artificial para empresas", "sistemas ERP a medida", "automatización de procesos B2B",
    "transformación digital", "plataformas logísticas", "Orion Technology"
  ],
  authors: [{ name: "Orion Technology" }],
  creator: "Orion Technology",
  publisher: "Orion Technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Orion Technology | Desarrollo de Software y Sistemas ERP a Medida",
    description: "Impulsamos empresas con tecnología avanzada: Inteligencia Artificial, Apps Móviles y plataformas web corporativas de alto rendimiento.",
    url: "https://www.oriontechnology.cl",
    siteName: "Orion Technology",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Orion Technology | Agencia de Desarrollo de Software",
    description: "Expertos en sistemas a medida, SaaS y automatización con IA.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <Analytics />
      </body>
    </html>
  );
}
