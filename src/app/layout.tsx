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
  title: "ReLife | AI-Powered Amazon Renewed & Circular Marketplace",
  description: "Experience the premier AI-verified circular economy marketplace. Shop Amazon Renewed refurbished tech, earn Green Credits, and reduce reverse logistics emissions.",
};

import Navbar from "@/components/shared/Navbar";
import CartProviderWrapper from "@/components/shared/CartProviderWrapper";
import WishlistProviderWrapper from "@/components/shared/WishlistProviderWrapper";

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
    >
      <body className="min-h-full flex flex-col bg-slate-100 font-sans text-slate-900">
        <WishlistProviderWrapper>
          <CartProviderWrapper>
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </CartProviderWrapper>
        </WishlistProviderWrapper>
      </body>
    </html>
  );
}
