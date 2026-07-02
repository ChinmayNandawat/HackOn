"use client";

import React from "react";
import { WishlistProvider } from "@/context/WishlistContext";

export default function WishlistProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      {children}
    </WishlistProvider>
  );
}
