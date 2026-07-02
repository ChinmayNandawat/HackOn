"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Leaf, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import AISizeAdvisorBanner from "@/components/AISizeAdvisorBanner";
import { isFashionItem, getNextSize, cleanProductTitle } from "@/lib/mock-prevention";
import { supabase } from "@/lib/supabase";

export default function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    updateSize, 
    clearCart, 
    totalCount, 
    subtotal, 
    greenCreditsEarned 
  } = useCart();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const router = useRouter();

  if (!isCartOpen) return null;

  // Helper to identify fashion items in cart
  const isFashion = (item: CartItem) => {
    return isFashionItem(item.product?.category, item.product?.title);
  };

  // Find the first fashion item in cart that could trigger a sizing mismatch
  const targetFashionItem = items.find((item) => isFashion(item) && item.selectedSize);

  // Determine recommended size
  const getRecommendedSize = (currentSize?: string) => {
    return getNextSize(currentSize);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      // Create orders for each item in cart
      for (const item of items) {
        // Insert order
        await supabase.from("orders").insert({
          buyer_id: "00000000-0000-0000-0000-000000000002",
          product_id: item.product.id,
          status: "completed",
        });

        // Mark product sold if needed
        await supabase
          .from("products")
          .update({ relist_status: "sold" })
          .eq("id", item.product.id);

        // If refurbished, fire impact log
        const isRefurb = item.product.condition === "refurbished" || item.product.is_refurbished;
        if (isRefurb) {
          fetch("/api/impact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "ssr-session",
              actionType: "buy_refurbished",
              productId: item.product.id,
            }),
          }).catch(console.error);
        }
      }

      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setCheckoutLoading(false);
        clearCart();
        closeCart();
        router.push("/orders");
      }, 2200);
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Your Cart
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {totalCount} {totalCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>
            <button 
              onClick={closeCart}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
            {checkoutSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Order Placed Successfully! 🎉
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your sustainable order has been processed. Return prevention protocols were active on your fashion items!
                </p>
                {greenCreditsEarned > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-200 shadow-sm">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    +{greenCreditsEarned} Green Credits Earned!
                  </div>
                )}
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Discover AI-verified refurbished items and sustainable fashion items with our return prevention size advisor!
                </p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* AI Size Advisor Banner */}
                {targetFashionItem && (
                  <AISizeAdvisorBanner 
                    cartItem={targetFashionItem}
                    recommendedSize={getRecommendedSize(targetFashionItem.selectedSize)}
                    onSwitchSize={updateSize}
                  />
                )}

                {/* Cart Items List */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const isRefurb = item.product.condition === "refurbished" || item.product.is_refurbished;
                    const displayImage = item.product.image_url || "https://via.placeholder.com/150";

                    return (
                      <div 
                        key={item.id}
                        className="flex gap-4 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow relative group"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/50 p-1.5 relative">
                          <img 
                            src={displayImage} 
                            alt={item.product.title}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                          />
                          {isRefurb && (
                            <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[8px] font-black px-1 py-0.2 rounded shadow">
                              AI ✓
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                {cleanProductTitle(item.product.title) || item.product.title}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                              {item.selectedSize && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-0.5 rounded-md shadow-xs">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.isLocalDeal && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                                  Local Deal
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                            <span className="text-[10px] text-slate-400 font-medium">
                              ₹{item.price.toLocaleString("en-IN")} each
                            </span>
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-slate-900 dark:text-white min-w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && !checkoutSuccess && (
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md space-y-4">
              
              {/* Green credits reward notice */}
              {greenCreditsEarned > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Leaf className="w-4 h-4 text-emerald-500 animate-bounce" />
                    <span>Sustainable Order Bonus</span>
                  </div>
                  <span className="text-xs font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    +{greenCreditsEarned} Green Credits
                  </span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Shipping <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">CO₂ Neutral 🌱</span>
                  </span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white text-white dark:text-slate-900 font-black text-sm tracking-wide shadow-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <span>Processing Sustainable Order...</span>
                ) : (
                  <>
                    <span>Checkout & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
