import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AssistantWidget from "@/components/assistant/AssistantWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CODE_PH — Assistência Técnica & Soluções Digitais",
    template: "%s | CODE_PH",
  },
  description:
    "Assistência técnica para computadores e celulares e desenvolvimento de soluções digitais para facilitar a gestão do seu negócio. Envie seu orçamento pelo WhatsApp.",
  keywords: [
    "assistência técnica",
    "formatação de computador",
    "manutenção de notebook",
    "assistência de celular",
    "sites e sistemas",
    "CODE_PH",
  ],
  openGraph: {
    title: "CODE_PH — Assistência Técnica & Soluções Digitais",
    description:
      "Tecnologia para simplificar o seu dia a dia. Assistência técnica, sites e sistemas.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AssistantWidget />
      </body>
    </html>
  );
}
