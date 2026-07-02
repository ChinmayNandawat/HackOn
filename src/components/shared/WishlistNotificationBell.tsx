"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, Leaf, Trash2, ArrowRight, X, Sparkles } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistNotificationBell() {
  const { activeMatches, removeMatch, clearAllMatches } = useWishlist();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-sm text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 group relative"
        title="Reverse Wishlist • Local Refurb Match Alert Hub"
        aria-label="Wishlist Notifications"
      >
        <div className="relative flex items-center">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 group-hover:text-[#0F766E] transition-colors shrink-0" />
          {activeMatches.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#0F766E] rounded-full animate-ping"></span>
          )}
        </div>
        <span className="hidden sm:inline font-bold">Alerts</span>
        
        {/* Animated Badge Count */}
        {activeMatches.length > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#0F766E] text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs animate-pulse">
            {activeMatches.length}
          </span>
        )}
      </button>

      {/* Sleek Dropdown Hub */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Dropdown Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-4 px-5 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#0F766E]/30 text-[#0F766E] border border-[#0F766E]/50">
                <Heart className="w-4 h-4 fill-[#0F766E]" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Reverse Wishlist Hub</h3>
                <p className="text-[11px] text-slate-400 font-medium">Local Refurbished Match Alerts</p>
              </div>
            </div>

            {activeMatches.length > 0 && (
              <button
                onClick={() => clearAllMatches()}
                className="text-[11px] font-bold text-slate-300 hover:text-white underline transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Matches List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-2">
            {activeMatches.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] flex items-center justify-center mx-auto border border-teal-100 dark:border-teal-900">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Active Matches Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Click the <span className="font-bold text-rose-500">♥ Heart icon</span> on any item to add it to your wishlist. When local refurbished deals drop, we will instantly notify you here!
                  </p>
                </div>
              </div>
            ) : (
              activeMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-all space-y-3 relative group/item border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {match.imageUrl && (
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={match.imageUrl}
                            alt={match.title}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#0F766E] bg-teal-50 dark:bg-teal-950/60 dark:text-teal-400 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 mb-1 uppercase tracking-wider">
                          <Leaf className="w-2.5 h-2.5" />
                          <span>Local Restock in {match.location}</span>
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {match.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMatch(match.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
                      title="Remove Match"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-xs text-slate-500 block font-medium">Refurb Deal Price</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">₹{match.price.toLocaleString("en-IN")}</span>
                      <span className="text-[11px] font-bold text-[#0F766E] ml-1.5">
                        (Save ₹{match.savings.toLocaleString("en-IN")})
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push(`/product/${match.id}`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0d625b] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 group/btn"
                    >
                      <span>View Deal</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 text-center border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1.5">
              <span>💡 Choosing circular reduces 85% e-waste</span>
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
