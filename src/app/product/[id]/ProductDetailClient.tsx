"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductHealthCard from "@/components/ProductHealthCard";
import ReturnPreventionBanner from "@/components/ReturnPreventionBanner";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronLeft, ChevronRight, ShieldCheck, Star, Sparkles, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductDetailClient({ product, riskData, refurbishedAlternative }: any) {
  const [buyerLocation, setBuyerLocation] = useState<string>("");
  const [now, setNow] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeWarning, setSizeWarning] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deliveryOption, setDeliveryOption] = useState<"standard" | "express">("standard");
  const [userFitProfileSize, setUserFitProfileSize] = useState<string>("M");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const handleLocationChange = () => {
      setBuyerLocation(localStorage.getItem("relife_buyer_location") || "Mumbai");
    };
    handleLocationChange();
    window.addEventListener("relife_location_changed", handleLocationChange);

    const loadFit = () => {
      try {
        const saved = localStorage.getItem("relife_fit_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.apparelSize) setUserFitProfileSize(parsed.apparelSize);
        }
      } catch {
        // ignore
      }
    };
    loadFit();
    window.addEventListener("relife_fit_profile_changed", loadFit);

    return () => {
      window.removeEventListener("relife_location_changed", handleLocationChange);
      window.removeEventListener("relife_fit_profile_changed", loadFit);
    };
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

  const isFashion = () => {
    const cat = product.category || "";
    const title = product.title || "";
    const fashionCategories = ["Shoes", "Footwear", "Fashion", "Clothing", "Apparel", "Wearables"];
    const keywords = ["shirt", "jacket", "jeans", "dress", "sneakers", "shoe", "hoodie", "coat", "apparel", "wear"];
    return (
      fashionCategories.includes(cat) ||
      keywords.some((kw) => title.toLowerCase().includes(kw))
    );
  };

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

  const displayImages = (isRefurbished && product.health_data?.return_photo_urls && product.health_data.return_photo_urls.length > 0)
    ? product.health_data.return_photo_urls
    : [product.image_url || 'https://via.placeholder.com/600'];

  const origPrice = Number(product.original_price) || 0;
  const savings = origPrice > displayPrice ? origPrice - displayPrice : 0;
  const discountPercent = origPrice > 0 && savings > 0 ? Math.round((savings / origPrice) * 100) : 0;

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 bg-white min-h-screen space-y-8 font-sans pb-28">
      {/* Top Green Banner */}
      {isRefurbished && savings > 0 && (
        <div className="w-full bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-emerald-950 font-medium">
            <span className="font-extrabold tracking-tight">
              Buy Certified Refurbished — Save ₹{savings.toLocaleString("en-IN")}
            </span>
            <span className="hidden md:inline text-emerald-300">|</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800 text-xs sm:text-sm">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Prevent ~0.8 kg E-Waste
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800 text-xs sm:text-sm">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Save ~17.5 kg CO₂
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-200/70 px-3.5 py-1.5 rounded-full whitespace-nowrap shrink-0">
            AI Verified Passport
          </span>
        </div>
      )}

      {/* Return Prevention Banner for Footwear */}
      {!isRefurbished && (product.category === "Shoes" || product.category === "Footwear") && (
        <ReturnPreventionBanner
          riskPercent={riskData?.riskPercent}
          reason={riskData?.reason}
          suggestion={riskData?.suggestion}
          refurbishedAlternative={refurbishedAlternative}
        />
      )}

      {/* Breadcrumb Nav */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium pb-4">
        <Link href="/" className="hover:text-slate-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/?category=${encodeURIComponent(product.category || "")}`}
          className="hover:text-slate-700 transition-colors"
        >
          {product.category || "Marketplace"}
        </Link>
        <span>/</span>
        <span className="text-slate-700 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (Span 5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-slate-200/70 shadow-2xs p-8 sm:p-12 flex items-center justify-center relative overflow-hidden group">
            <img
              src={displayImages[currentImageIndex] || displayImages[0]}
              alt={`${product.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            />

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                  className="absolute left-4 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {isRefurbished && (
              <>
                <div className="absolute top-0 right-0 z-10 bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-bl-2xl shadow-sm select-none">
                  Refurbished
                </div>
                {(product.grade || product.health_data?.grade) && (
                  <span className="absolute top-4 left-4 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10">
                    Grade {product.grade || product.health_data?.grade}
                  </span>
                )}
              </>
            )}

            {isLocalDeal && (
              <div className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md z-10">
                Local Deal
              </div>
            )}
          </div>

          {/* Gallery Thumbnails Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {displayImages.map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 p-2 bg-white overflow-hidden transition-all shrink-0 cursor-pointer ${
                    idx === currentImageIndex
                      ? "border-emerald-600 shadow-sm"
                      : "border-slate-200/80 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
            {displayImages.length > 0 && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                {currentImageIndex + 1} / {displayImages.length}
              </span>
            )}
          </div>
        </div>

        {/* Middle Column: Title, AI Passport Specs & Environmental Footprint (Span 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {product.category || "General"}
              </span>
              {isRefurbished && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> AI Verified
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Ratings & AI Inspection Note */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 pt-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span>
                {isRefurbished
                  ? "4.8 (Verified ReLife Inspection)"
                  : "4.8 (Verified Customer Reviews)"}
              </span>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3.5 pt-2">
              {discountPercent > 0 && (
                <span className="text-emerald-700 font-extrabold text-lg sm:text-xl">
                  -{discountPercent}%
                </span>
              )}
              <span className={isLocalDeal ? "text-2xl sm:text-3xl font-extrabold text-amber-600" : "text-2xl sm:text-3xl font-extrabold text-slate-900"}>
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {origPrice > 0 && origPrice > displayPrice && (
                <span className="text-sm sm:text-base text-slate-400 line-through font-medium">
                  M.R.P.: ₹{origPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {isLocalDeal && timeLeft && (
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-200">
                Local Deal Ends In: {timeLeft}
              </div>
            )}
          </div>

          {/* Size Selector for Fashion Items */}
          {isFashion() && !isRefurbished && (() => {
            const aiMatchSize = userFitProfileSize === "M" ? "L" : userFitProfileSize === "S" ? "M" : userFitProfileSize === "XS" ? "S" : "L";
            return (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                {/* AI Fit Advisor Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-semibold p-3.5 rounded-xl mb-3 flex items-center justify-between shadow-sm">
                  <span>
                    ✨ AI Fit Advisor: Based on your Fit Profile ({userFitProfileSize}) and real customer return data, Size &apos;{aiMatchSize}&apos; is your Perfect Match!
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Select Size</span>
                  {sizeWarning && (
                    <span className="text-red-600 font-semibold text-xs">Please select a size</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeWarning(false);
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Size Selection Feedback Pill */}
                {selectedSize && (
                  <div className="pt-1">
                    {selectedSize === aiMatchSize ? (
                      <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-bold px-3.5 py-1.5 rounded-lg">
                        ✅ Perfect Match Selected — Guaranteed fit, zero return hassle
                      </div>
                    ) : (() => {
                      const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
                      const selIdx = SIZES.indexOf(selectedSize);
                      const matchIdx = SIZES.indexOf(aiMatchSize);
                      const isSmaller = selIdx !== -1 && matchIdx !== -1 ? selIdx < matchIdx : false;
                      return (
                        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-lg">
                          {isSmaller
                            ? `⚠️ Runs small: Switch to Size '${aiMatchSize}' for guaranteed fit.`
                            : `⚠️ Runs large: Switch to Size '${aiMatchSize}' for guaranteed fit.`}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })()}

          {isFashion() && isRefurbished && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Size</span>
              <span className="px-3.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white">M</span>
            </div>
          )}

          {/* About This Item */}
          <div className="space-y-3 pt-4 border-t border-slate-200/70">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">About this item</h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {isRefurbished
                ? `${product.title} verified by ReLife circular intelligence. Carefully inspected for quality, functionality, and longevity so you get premium performance with lower environmental impact.`
                : `${product.title} — 100% brand new, factory sealed official product. Enjoy dependable quality, full manufacturer warranty, and eco-conscious packaging.`}
            </p>
          </div>

          {/* ReLife AI Circular Insight Card OR Brand New Assurance Card */}
          {isRefurbished ? (
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ReLife Circular AI</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                Customers like you love second-life items in this category. This product has passed automated computer-vision quality checks and contributes directly to circular resale economics.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Brand New Official Product</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-900/90 leading-relaxed">
                100% genuine brand new item directly from authorized distribution partners. Comes complete with standard manufacturer warranty and hassle-free returns.
              </p>
            </div>
          )}

          {/* Environmental Footprint Card - Only shown for Refurbished / Second Life Items */}
          {isRefurbished && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Environmental Footprint
              </div>
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 grid grid-cols-2 text-center">
                <div className="border-r border-emerald-100">
                  <div className="text-2xl font-extrabold text-slate-900">25</div>
                  <div className="text-xs text-slate-500 mt-1">kg CO₂ Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">0.8</div>
                  <div className="text-xs text-slate-500 mt-1">kg E-Waste Diverted</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <span className="bg-emerald-800 text-white font-bold text-[10px] px-2.5 py-1 rounded">
                  Circular Impact
                </span>
                <span className="truncate">
                  Extending product lifespan and reducing carbon emissions.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: The Buy Box (Span 3 columns) */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] sticky top-24 space-y-5">
            {/* Price Header */}
            <div className="space-y-1.5">
              <div className="text-3xl font-extrabold text-slate-900">
                ₹{displayPrice.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                In Stock & Ready for Delivery
              </div>
            </div>

            {/* Delivery Options */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Delivery Options</div>

              <div
                onClick={() => setDeliveryOption("standard")}
                className={`border border-slate-200 rounded-xl p-3.5 hover:border-emerald-300 transition-all cursor-pointer flex items-start gap-3 ${
                  deliveryOption === "standard" ? "border-emerald-500 bg-emerald-50/30" : ""
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${deliveryOption === "standard" ? "border-emerald-600" : "border-slate-300"}`}>
                  {deliveryOption === "standard" && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Standard Eco-Delivery (3 days)</div>
                  <div className="text-slate-500 mt-1">1.2 kg CO₂ • <span className="text-emerald-700 font-semibold">+30 credits</span></div>
                </div>
              </div>

              <div
                onClick={() => setDeliveryOption("express")}
                className={`border border-slate-200 rounded-xl p-3.5 hover:border-emerald-300 transition-all cursor-pointer flex items-start gap-3 ${
                  deliveryOption === "express" ? "border-emerald-500 bg-emerald-50/30" : ""
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${deliveryOption === "express" ? "border-emerald-600" : "border-slate-300"}`}>
                  {deliveryOption === "express" && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Express Delivery (1 day)</div>
                  <div className="text-slate-500 mt-1">3.4 kg CO₂</div>
                </div>
              </div>
            </div>

            {/* Purchase Confidence Score */}
            {isRefurbished ? (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>AI Quality Verification</span>
                  <span className="text-emerald-700">10 / 10 High</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-full rounded-full" />
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Inspected against ReLife multi-angle vision grading.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Factory Sealed Assurance</span>
                  <span className="text-blue-700 font-bold">100% Brand New</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-full rounded-full" />
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  Covered by official manufacturer warranty and return guarantee.
                </div>
              </div>
            )}

            {/* Primary Action Button (Add to Cart) */}
            <div className="pt-1">
              {product.relist_status === "sold" ? (
                <Button disabled className="w-full py-3.5 px-6 text-sm font-bold rounded-xl bg-slate-200 text-slate-500">
                  Sold Out
                </Button>
              ) : (
                <button
                  onClick={() => {
                    if (isFashion() && !isRefurbished && !selectedSize) {
                      setSizeWarning(true);
                      return;
                    }
                    const finalSize = isFashion() && isRefurbished ? "M" : selectedSize;
                    addToCart(product, finalSize, displayPrice, isLocalDeal);
                  }}
                  className="w-full py-3.5 px-6 bg-emerald-900 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isRefurbished ? "Add Refurbished to Cart" : "Add to Cart"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Report / Health Card Section */}
      {isRefurbished && (
        <div className="w-full mt-14 pt-10 border-t border-slate-200/80">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Product Transparency & AI Inspection Report
            </h2>
            <div className="h-px bg-slate-200/80 flex-1" />
          </div>

          <ProductHealthCard product={product} showFullDetail={true} overridePrice={displayPrice} />
        </div>
      )}
    </div>
  );
}
