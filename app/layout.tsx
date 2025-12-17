import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sygmund v2",
  description: "Gestão Clínica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* 👇 AQUI ATIVAMOS A SEGURANÇA NO SITE TODO */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}