import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calendário Editorial — Gerador de PDF",
  description:
    "Monte o calendário editorial do cliente e exporte um pôster em PDF (A4) — fundo preto, tipografia Transducer, detalhes em laranja.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
