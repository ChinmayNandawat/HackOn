"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  ChevronDown, 
  Leaf, 
  Package, 
  Store, 
  Sparkles, 
  Menu, 
  X,
  MapPin
} from "lucide-react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad"];

export default function Navbar() {
  const [location, setLocation] = useState<string>("Mumbai");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem("relife_buyer_location");
    if (saved && CITIES.includes(saved)) {
      setLocation(saved);
    } else {
      localStorage.setItem("relife_buyer_location", location);
    }
  }, [location]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLoc = e.target.value;
    setLocation(newLoc);
    localStorage.setItem("relife_buyer_location", newLoc);
    window.dispatchEvent(new Event("relife_location_changed"));
  };

  const navLinks = [
    { name: "Shop Refurbished", href: "/" },
    { name: "Local Deals", href: "/?deal=local" },
    { name: "My Impact", href: "/impact", icon: Leaf, iconClass: "text-[#0F766E]" },
    { name: "Seller Studio", href: "/seller", icon: Store, iconClass: "text-slate-600" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-slate-200/80 font-sans transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand Name & Friendly Location Pill */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-1 group py-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-[#0F766E]">
              ReLife
            </span>
          </Link>

          {/* Friendly Location Selector Pill */}
          <div className="relative group/loc flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/60 text-slate-700 text-xs font-semibold transition-all cursor-pointer">
            <span className="text-sm">📍</span>
            <span className="truncate max-w-[140px] sm:max-w-none">Delivering to <strong className="text-slate-900 font-bold">{location}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 group-hover/loc:text-slate-700 transition-colors" />
            
            <select 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              value={location}
              onChange={handleLocationChange}
              title="Change Delivery City"
            >
              {CITIES.map(city => (
                <option key={city} value={city} className="text-slate-900 bg-white font-medium">
                  Delivering to {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Core Links (Airy & Clean spacing) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors py-1 relative ${
                  isActive 
                    ? "text-[#0F766E] font-bold" 
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${link.iconClass || ""}`} />}
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0F766E] rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Orders & Minimalist Cart Button */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          
          {/* My Orders Link */}
          <Link 
            href="/orders" 
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
              pathname === "/orders" 
                ? "bg-slate-100 text-[#0F766E] font-bold" 
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
            }`}
          >
            <Package className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">My Orders</span>
          </Link>

          {/* Minimalist Cart Button with Soft Teal Item Badge */}
          <button
            onClick={openCart}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-sm text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 group"
            title="Open Shopping Cart"
          >
            <div className="relative flex items-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 group-hover:text-[#0F766E] transition-colors shrink-0" />
            </div>
            <span>Cart</span>
            
            {/* Soft Teal / Forest Green Badge */}
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#0F766E] text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              {totalCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAFAF9] border-t border-slate-200/80 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive 
                      ? "bg-slate-200/70 text-[#0F766E] font-bold" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 shrink-0 ${link.iconClass || ""}`} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between px-3">
            <Link 
              href="/orders" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>View My Orders & Returns</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
