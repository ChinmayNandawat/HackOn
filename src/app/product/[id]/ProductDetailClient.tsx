"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductHealthCard from "@/components/ProductHealthCard";
import BuyRefurbishedButton from "@/components/BuyRefurbishedButton";
import BuyNewButton from "@/components/BuyNewButton";
import ReturnPreventionBanner from "@/components/ReturnPreventionBanner";
import { Button } from "@/components/ui/button";

export default function ProductDetailClient({ product, riskData, refurbishedAlternative }: any) {
  const [buyerLocation, setBuyerLocation] = useState<string>("");
  const [now, setNow] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    setNow(Date.now());
    const handleLocationChange = () => {
      setBuyerLocation(localStorage.getItem("relife_buyer_location") || "Mumbai");
    };
    handleLocationChange();
    window.addEventListener("relife_location_changed", handleLocationChange);
    return () => window.removeEventListener("relife_location_changed", handleLocationChange);
  }, []);

  useEffect(() => {
    if (!product.local_only_until) return;
    const calculateTimeLeft = () => {
      const difference = new Date(product.local_only_until).getTime() - new Date().getTime();
      if (difference > 0) {
        const h = Math.floor((difference / (1000 * 60 * 60)));
        const m = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft(`${h}h ${m}m`);
      } else {
        setTimeLeft("");
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [product.local_only_until]);

  const isRefurbished = product.is_refurbished === true;
  let isLocalDeal = false;
  let displayPrice = (isRefurbished ? product.estimated_resale_price : product.original_price) || 0;
  
  if (isRefurbished && product.local_only_until && now > 0) {
     const dealActive = new Date(product.local_only_until).getTime() > now;
     if (dealActive) {
       if (product.location !== buyerLocation) {
         return (
           <div className="max-w-2xl mx-auto mt-20 p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl">
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Available in Your Region</h2>
             <p className="text-gray-500 mb-6">This item is currently an exclusive local deal for buyers in {product.location}. Please check back later.</p>
             <Link href="/" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm inline-flex items-center gap-2 hover:bg-gray-800">
               Back to Marketplace
             </Link>
           </div>
         );
       }
       isLocalDeal = true;
       displayPrice = product.local_deal_price || displayPrice;
     } else if (!dealActive && product.standard_price) {
       displayPrice = product.standard_price;
     }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 font-sans pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-semibold mb-2">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>→</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-900 transition-colors">
          {product.category}
        </Link>
        <span>→</span>
        <span className="text-gray-900 truncate">{product.title}</span>
      </nav>

      {/* Header Info */}
      <div className="space-y-2">
        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-extrabold uppercase tracking-widest">
          {product.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
          {product.title}
        </h1>
        <div className="flex items-end gap-3 mt-4">
          {isRefurbished ? (
            <>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className={isLocalDeal ? "text-4xl font-black text-amber-500" : "text-4xl font-black text-emerald-600"}>
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg font-bold text-gray-400 line-through mb-1">
                    ₹{(product.original_price || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {isLocalDeal && timeLeft && (
                  <span className="inline-flex items-center gap-1.5 mt-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md self-start border border-amber-200">
                    Local Deal Ends In: {timeLeft}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-4xl font-black text-gray-900">
              ₹{(product.original_price || 0).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      {/* RETURN PREVENTION BANNER */}
      {!isRefurbished && (
        <ReturnPreventionBanner 
          riskPercent={riskData.riskPercent}
          reason={riskData.reason}
          suggestion={riskData.suggestion}
          refurbishedAlternative={refurbishedAlternative}
        />
      )}

      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
        <img 
          src={product.image_url || 'https://via.placeholder.com/600'} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
        {isLocalDeal && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-4 py-2 rounded-lg shadow-lg">
            Local Deal
          </div>
        )}
      </div>

      {/* Transparency Report / Health Card */}
      {isRefurbished && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4 opacity-80">
            <div className="h-px bg-gray-300 flex-1" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              Product Transparency Report
            </h3>
            <div className="h-px bg-gray-300 flex-1" />
          </div>
          
          <ProductHealthCard product={product} showFullDetail={true} />
        </div>
      )}

      {/* Add to Cart / Buy Button */}
      <div className="pt-6">
        {product.relist_status === 'sold' ? (
          <Button disabled className="w-full py-7 text-lg font-black tracking-wide rounded-xl shadow-xl bg-slate-200 text-slate-500 opacity-70">
            Sold Out
          </Button>
        ) : isRefurbished ? (
          <BuyRefurbishedButton 
            productId={product.id}
            originalPrice={product.original_price}
            estimatedResalePrice={displayPrice}
          />
        ) : (
          <BuyNewButton productId={product.id} />
        )}
      </div>
    </div>
  );
}
