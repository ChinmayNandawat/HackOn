import type { Metadata } from "next";
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
  title: "ReLife",
  description: "Your Own ReLife",
  icons: {
    icon: [
      { url: "/logo3.png?v=3", href: "/logo3.png?v=3" },
      { url: "/icon.png?v=3", href: "/icon.png?v=3" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-icon.png?v=3",
  },
};

import Navbar from "@/components/shared/Navbar";
import CartProviderWrapper from "@/components/shared/CartProviderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">
        <CartProviderWrapper>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
        </CartProviderWrapper>
      </body>
    </html>
  );
}
