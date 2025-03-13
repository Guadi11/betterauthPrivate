import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/lib/auth"; // Añade esta importación
import Sidebar from '@/components/layout/side-nav'; // Añade esta importación
import "./globals.css";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contra Inteligencia",
  description: "Sistema de Gestion de Contra Inteligencia. Desarrollado por Navarro Ramiro",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reqHeaders = await headers();

  const session = await auth.api.getSession({headers: reqHeaders});

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen">
          {session?.user ? (
            <>
              <Sidebar />
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </>
          ) : (
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          )}
        </div>
      </body>
    </html>
  );
}