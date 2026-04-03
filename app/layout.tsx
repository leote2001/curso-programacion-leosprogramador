import type { Metadata } from "next";
import RecaptchaProvider from "./components/RecaptchaProvider";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Curso Programación Desde Cero + IA",
  description: "Aprende los fundamentos de la programación y el uso de la IA.",
  openGraph: {
    title: "Curso Programación Desde Cero + IA",
    description: "Aprende los fundamentos de la programación y el uso de la IA.",
    url: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL,
    type: "website",
    images: [`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/og`],
    locale: "es_AR",
    siteName: "Leo S Programador"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        aria-live="polite"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RecaptchaProvider>
          {children}
        </RecaptchaProvider>
      </body>
    </html>
  );
}
