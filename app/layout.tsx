import type { Metadata } from "next";
import { auth } from "@/lib/auth"; // Añade esta importación
import Sidebar from '@/components/layout/side-nav'; // Añade esta importación
import "./globals.css";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner" 

const systemFontClass = "antialiased";

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
      <body className={systemFontClass}>
        <div className="flex h-screen">
          {session?.user ? (
            <>
              <Sidebar />
              <main className="flex-1 overflow-auto p-6">
                {children}
                <Toaster position="top-right"/>
              </main>
            </>
          ) : (
            <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-500 w-full">
              {children}
              <Toaster/>
            </main>
          )}
        </div>
      </body>
    </html>
  );
}