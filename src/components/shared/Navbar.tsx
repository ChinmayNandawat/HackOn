"use client";

import Link from 'next/link';
import { Leaf, MapPin, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai"];

export default function Navbar() {
  const [location, setLocation] = useState<string>("Mumbai"); // Default
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem("relife_buyer_location");
    if (saved && CITIES.includes(saved)) {
      setLocation(saved);
    } else {
      localStorage.setItem("relife_buyer_location", location);
    }
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLoc = e.target.value;
    setLocation(newLoc);
    localStorage.setItem("relife_buyer_location", newLoc);
    window.dispatchEvent(new Event("relife_location_changed"));
  };

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-3 md:gap-0">
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <Link href="/" className="text-xl font-black tracking-tight text-slate-900 hover:text-emerald-700 transition-colors">
          ReLife
        </Link>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
          <select
            className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer text-xs sm:text-sm"
            value={location}
            onChange={handleLocationChange}
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
        {/* Buyer Links */}
        <Link href="/orders" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap">Orders</Link>
        <Link href="/impact" className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors whitespace-nowrap">
          <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          My Impact
        </Link>

        {/* Cart Button */}
        <button
          onClick={openCart}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          title="Open Cart"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart</span>
          {totalCount > 0 && (
            <span className="ml-0.5 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {totalCount}
            </span>
          )}
        </button>

        <span className="text-slate-200 ml-1 sm:ml-2">|</span>
        {/* Seller Links */}
        <Link href="/seller" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap">Seller Dashboard</Link>
      </div>
    </nav>
  );
}

