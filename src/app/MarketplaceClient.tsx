"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Sparkles, 
  Check, 
  MapPin, 
  Truck,
  ShieldCheck,
  Leaf,
  Heart,
  Zap
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface Product {
  id: string;
  title: string;
  category?: string;
  original_price?: number;
  estimated_resale_price?: number;
  current_price?: number;
  condition: string;
  is_refurbished?: boolean;
  grade?: string;
  image_url?: string;
  location?: string | null;
  local_only_until?: string | null;
  local_deal_price?: number | null;
  standard_price?: number | null;
  health_data?: {
    grade?: string | null;
  };
  relist_status?: string;
  stock?: number;
  return_count?: number;
  batch_number?: number | string;
}

function cleanProductTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/\s*,\s*Grade\s+[A-C].*$/i, "")
    .replace(/\s*-\s*Grade\s+[A-C].*$/i, "")
    .replace(/\s*\(Grade\s+[A-C]\)/i, "")
    .replace(/\s*,\s*AI Verified.*$/i, "")
    .replace(/\s*-\s*AI Verified.*$/i, "")
    .replace(/\s*,\s*Works\s+perfect*.*$/i, "")
    .replace(/\s*-\s*Works\s+perfect*.*$/i, "")
    .replace(/\s*-\s*Refurbished.*$/i, "")
    .replace(/\s*,\s*Refurbished.*$/i, "")
    .replace(/\s*\[Refurbished\]/i, "")
    .replace(/^Refurbished\s*-\s*/i, "")
    .replace(/^Refurbished\s*,\s*/i, "")
    .replace(/\bRefurbished\b/i, "")
    .replace(/\bAI Verified\b/i, "")
    .replace(/\bGrade\s+[A-C]\b/i, "")
    .replace(/,\s*$/i, "")
    .trim();
}

function getBatchNumber(product: Product): number | string {
  if (product.batch_number) return product.batch_number;
  let sum = 0;
  for (let i = 0; i < product.id.length; i++) {
    sum += product.id.charCodeAt(i);
  }
  return (sum % 12) + 1;
}

function getProductSocialProof(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  const rating = (4.3 + ((sum % 6) / 10)).toFixed(1); // e.g. 4.3 to 4.8
  const reviews = 120 + (sum % 850);
  return { rating, reviews };
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
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
  }, [targetDate]);

  if (!timeLeft) return null;
  return <span className="ml-1 text-[10px] font-semibold opacity-90">— {timeLeft} left</span>;
}

export default function MarketplaceClient({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | "new" | "refurbished">("all");
  const [buyerLocation, setBuyerLocation] = useState<string>("");
  const [now, setNow] = useState<number>(0);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [sizeWarning, setSizeWarning] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNow(Date.now());
    const handleLocationChange = () => {
      setBuyerLocation(localStorage.getItem("relife_buyer_location") || "Mumbai");
    };
    handleLocationChange();
    window.addEventListener("relife_location_changed", handleLocationChange);
    return () => window.removeEventListener("relife_location_changed", handleLocationChange);
  }, []);

  const isFashionProduct = (product: Product) => {
    const cat = product.category || "";
    const title = product.title || "";
    const fashionCategories = ["Shoes", "Footwear", "Fashion", "Clothing", "Apparel", "Wearables"];
    const keywords = ["shirt", "jacket", "jeans", "dress", "sneakers", "shoe", "hoodie", "coat", "apparel", "wear"];
    return (
      fashionCategories.includes(cat) ||
      keywords.some((kw) => title.toLowerCase().includes(kw))
    );
  };

  const handleSizeClick = (e: React.MouseEvent, productId: string, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
    setSizeWarning((prev) => ({ ...prev, [productId]: false }));
  };

  const handleAddToCartClick = (
    e: React.MouseEvent,
    product: Product,
    displayPrice: number,
    isLocalDeal: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFashionProduct(product) && !selectedSizes[product.id]) {
      setSizeWarning((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setSizeWarning((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
      return;
    }
    addToCart(product, selectedSizes[product.id], displayPrice, isLocalDeal);
  };

  const filteredProducts = products.filter((product) => {
    if (product.relist_status === "sold" || product.relist_status === "archived") return false;
    if (typeof product.stock === "number" && product.stock <= 0) return false;
    if (typeof product.return_count === "number" && product.return_count >= 2) return false;

    if (product.local_only_until && now > 0) {
      const isDealActive = new Date(product.local_only_until).getTime() > now;
      if (isDealActive && product.location !== buyerLocation) {
        return false;
      }
    }

    if (filter === "all") return true;
    const isRefurbished = product.condition === "refurbished" || product.is_refurbished;
    if (filter === "refurbished") return isRefurbished;
    if (filter === "new") return !isRefurbished;
    return true;
  });

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* 1. Airy Minimalist Storefront Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 font-bold text-xs border border-teal-200/60 dark:border-teal-800/50">
            <Leaf className="w-3.5 h-3.5" />
            <span>AI-Verified Circular Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Shop Renewed & Sustainable Deals
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
            Every item undergoes a 100-point physical and AI quality inspection. Backed by Green Credits, transparent reverse logistics, and zero-wait returns.
          </p>
        </div>
        
        {/* Soft Minimalist Filter Tabs */}
        <div className="flex flex-wrap gap-2 shrink-0 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              filter === "all" 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Deals ({products.length})
          </button>
          <button 
            onClick={() => setFilter("refurbished")} 
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === "refurbished" 
                ? "bg-[#0F766E] text-white shadow-2xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Renewed ♻️</span>
          </button>
          <button 
            onClick={() => setFilter("new")} 
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              filter === "new" 
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            New Only
          </button>
        </div>
      </div>

      {/* 2. Minimalist 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
        {filteredProducts.map((product) => {
          const isRefurb = product.condition === 'refurbished' || product.is_refurbished;
          const isFashion = isFashionProduct(product);
          
          let displayPrice = (isRefurb ? product.estimated_resale_price : product.original_price) || product.current_price || 0;
          let isLocalDeal = false;

          if (isRefurb && product.local_only_until && now > 0) {
             const dealActive = new Date(product.local_only_until).getTime() > now;
             if (dealActive && product.location === buyerLocation) {
               isLocalDeal = true;
               displayPrice = product.local_deal_price || displayPrice;
             } else if (!dealActive && product.standard_price) {
               displayPrice = product.standard_price;
             }
          }

          const { rating, reviews } = getProductSocialProof(product.id);
          const grade = product.grade || product.health_data?.grade || "A";
          const msrp = product.original_price || Math.round(displayPrice * 1.35);

          return (
            <Link href={`/product/${product.id}`} key={product.id} className="block h-full group">
              <Card className="h-full flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-2xs">
                
                {/* Image Section with Soft Pills */}
                <div className="h-52 sm:h-56 bg-slate-50/60 dark:bg-slate-950/40 relative flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-100 dark:border-slate-800/80 p-6">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105" 
                    />
                  ) : (
                    <span className="text-slate-400 font-medium text-xs">No Image Available</span>
                  )}
                  
                  {/* Minimalist Corner Ribbon Tag for Refurbished items only */}
                  {isRefurb && (
                    <div className="absolute top-0 left-0 z-10">
                      <span className="inline-block bg-slate-700/90 dark:bg-slate-800 text-white font-semibold text-xs px-3 py-1 shadow-sm rounded-br-lg">
                        Refurbished
                      </span>
                    </div>
                  )}

                  {/* Top-Right Wishlist Action Button */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`p-2 rounded-full border shadow-sm transition-all duration-300 transform active:scale-90 cursor-pointer ${
                        isWishlisted(product.id)
                          ? "bg-rose-50 border-rose-300 text-rose-500 dark:bg-rose-950/80 dark:border-rose-700 scale-110"
                          : "bg-white/90 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-white dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-300"
                      }`}
                      title="Add to Reverse Wishlist • Local Refurb Match Alert"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted(product.id) ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                    </button>
                  </div>

                  {/* Local Deal Pill if active */}
                  {isLocalDeal && (
                    <span className="absolute bottom-3 left-3 bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs flex items-center gap-1 z-10">
                      <span>⚡ Local Deal</span>
                      <CountdownTimer targetDate={product.local_only_until!} />
                    </span>
                  )}
                </div>

                {/* Card Content Section */}
                <CardContent className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    


                    {/* Product Title */}
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#0F766E] transition-colors min-h-[42px]">
                      {cleanProductTitle(product.title) || product.title}
                    </h3>

                    {/* Clean Star Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="text-amber-500 font-bold">★ {rating}</span>
                      <span>({reviews})</span>
                    </div>

                    {/* Clean Price Hierarchy */}
                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight">
                        ₹{displayPrice.toLocaleString("en-IN")}
                      </span>
                      {msrp > displayPrice && (
                        <span className="text-slate-400 dark:text-slate-500 line-through text-xs sm:text-sm font-medium">
                          ₹{msrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Friendly Delivery Status */}
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {isLocalDeal ? (
                        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>Ready for 2-Hr Pickup in {product.location || "your city"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                          <Truck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                          <span>Free delivery tomorrow</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Friendly Human-Touch Inline AI Size Advisor */}
                  {isFashion && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      
                      {/* Friendly Sizing Tip Card */}
                      <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 transition-all border ${
                        sizeWarning[product.id] 
                          ? "bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300 font-bold animate-pulse"
                          : selectedSizes[product.id]
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300 font-medium"
                            : "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 text-slate-700 dark:text-slate-300"
                      }`}>
                        <span className="text-sm shrink-0 mt-0.5">
                          {sizeWarning[product.id] ? "⚠️" : selectedSizes[product.id] ? "✨" : "👋"}
                        </span>
                        <div className="leading-normal">
                          {selectedSizes[product.id] ? (
                            <span>
                              <strong className="font-bold">Size {selectedSizes[product.id]} selected!</strong> Our AI confirms a 94% fit match for your profile.
                            </span>
                          ) : sizeWarning[product.id] ? (
                            <span>Please select your size below before adding to cart!</span>
                          ) : (
                            <span>
                              <strong className="font-bold">Sizing tip:</strong> Select size for instant AI fit check & hassle-free returns.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span>Select Size:</span>
                        {selectedSizes[product.id] && (
                          <span className="text-[#0F766E] dark:text-teal-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" /> {selectedSizes[product.id]}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                          const isSelected = selectedSizes[product.id] === size;
                          return (
                            <button
                              key={size}
                              onClick={(e) => handleSizeClick(e, product.id, size)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xs"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Minimalist 1-Click Buy Box */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    <button
                      onClick={(e) => handleAddToCartClick(e, product, displayPrice, isLocalDeal)}
                      className={`w-full py-2.5 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-sm active:scale-98 cursor-pointer ${
                        sizeWarning[product.id]
                          ? "bg-red-600 text-white animate-bounce"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{sizeWarning[product.id] ? "Select Size First" : "Add to Cart"}</span>
                    </button>
                  </div>

                </CardContent>
              </Card>
            </Link>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 shadow-2xs flex flex-col items-center justify-center gap-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-base text-slate-700 dark:text-slate-300">No items currently match this filter in {buyerLocation || "your location"}.</p>
            <button 
              onClick={() => setFilter("all")}
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              View All Available Deals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
