"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, ArrowRight, CheckCircle2, Leaf } from "lucide-react";
import { cleanProductTitle } from "@/lib/mock-prevention";

export interface WishlistMatch {
  id: string;
  title: string;
  price: number;
  savings: number;
  imageUrl?: string;
  location?: string;
  timestamp: number;
}

interface WishlistContextType {
  wishlistIds: string[];
  activeMatches: WishlistMatch[];
  currentAlert: WishlistMatch | null;
  toggleWishlist: (product: any) => void;
  isWishlisted: (id: string) => boolean;
  dismissAlert: () => void;
  removeMatch: (id: string) => void;
  clearAllMatches: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [activeMatches, setActiveMatches] = useState<WishlistMatch[]>([]);
  const [currentAlert, setCurrentAlert] = useState<WishlistMatch | null>(null);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem("relife_wishlist");
      if (savedIds) {
        setWishlistIds(JSON.parse(savedIds));
      }
      const savedMatches = localStorage.getItem("relife_wishlist_matches");
      if (savedMatches) {
        setActiveMatches(JSON.parse(savedMatches));
      }
    } catch (e) {
      console.error("Failed to load wishlist data from localStorage:", e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem("relife_wishlist", JSON.stringify(wishlistIds));
    } catch (e) {
      console.error("Failed to save wishlistIds:", e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem("relife_wishlist_matches", JSON.stringify(activeMatches));
    } catch (e) {
      console.error("Failed to save activeMatches:", e);
    }
  }, [activeMatches]);

  const isWishlisted = (id: string) => {
    return wishlistIds.includes(String(id));
  };

  const toggleWishlist = (product: any) => {
    const id = String(product.id);
    if (isWishlisted(id)) {
      // Remove from wishlist
      setWishlistIds((prev) => prev.filter((item) => item !== id));
    } else {
      // Add to wishlist
      setWishlistIds((prev) => [...prev, id]);

      // Proactive "Circular Deal Intercept" Notification
      const basePrice =
        product.original_price ||
        product.estimated_resale_price ||
        product.current_price ||
        product.standard_price ||
        5000;
      const savings = Math.round(basePrice * 0.30);
      const dealPrice = Math.round(basePrice * 0.70);
      const buyerCity =
        typeof window !== "undefined"
          ? localStorage.getItem("relife_buyer_location") || product.location || "your city"
          : "your city";

      const newMatch: WishlistMatch = {
        id: id,
        title: cleanProductTitle(product.title) || product.title || "Selected Item",
        price: dealPrice,
        savings: savings,
        imageUrl:
          product.image_url ||
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        location: buyerCity,
        timestamp: Date.now(),
      };

      // Add to active matches list if not already present
      setActiveMatches((prev) => {
        if (prev.some((m) => m.id === id)) return prev;
        return [newMatch, ...prev];
      });

      // Immediately trigger eye-catching notification toast
      setCurrentAlert(newMatch);
    }
  };

  const dismissAlert = () => {
    setCurrentAlert(null);
  };

  const removeMatch = (id: string) => {
    setActiveMatches((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllMatches = () => {
    setActiveMatches([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        activeMatches,
        currentAlert,
        toggleWishlist,
        isWishlisted,
        dismissAlert,
        removeMatch,
        clearAllMatches,
      }}
    >
      {children}

      {/* Proactive "Circular Deal Intercept" Toast Notification Modal */}
      {currentAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#0F766E] rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Top Emerald Header Accent */}
            <div className="bg-gradient-to-r from-[#0F766E] to-[#00A86B] p-3.5 px-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm tracking-wide uppercase">
                <Leaf className="w-4 h-4 animate-bounce" />
                <span>🎉 Local Circular Deal Match Found!</span>
              </div>
              <button
                onClick={dismissAlert}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="Close Notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4">
              <div className="flex gap-4 items-center">
                {currentAlert.imageUrl && (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img
                      src={currentAlert.imageUrl}
                      alt={currentAlert.title}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {currentAlert.title}
                  </h4>
                  <p className="text-xs font-bold text-[#0F766E] dark:text-teal-400">
                    Restocked in {currentAlert.location} • Verified Grade-A
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-xl border border-teal-100 dark:border-teal-800/60">
                Good news! A verified <strong className="font-extrabold text-slate-900 dark:text-white">Grade-A Refurbished</strong> version of this item was just restocked in your city. Save <strong className="font-black text-[#0F766E] dark:text-teal-400">30% (₹{currentAlert.savings.toLocaleString("en-IN")})</strong> and earn double green credits by choosing circular!
              </p>

              {/* Action Button */}
              <button
                onClick={() => {
                  dismissAlert();
                  router.push(`/product/${currentAlert.id}`);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0d625b] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 group"
              >
                <span>View Local Refurb Deal ⚡</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
