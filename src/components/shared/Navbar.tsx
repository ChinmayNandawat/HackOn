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
    <nav className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-3 md:gap-0">
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 hover:text-slate-700 transition-colors">
          <img src="/logo3.png" alt="ReLife Logo" className="h-11 md:h-12 w-auto object-contain scale-110 origin-left transition-transform duration-300" />
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent">ReLife</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-full">
          <MapPin className="w-3 h-3 text-slate-400" />
          <select
            className="bg-transparent border-none outline-none font-medium text-slate-600 cursor-pointer text-xs"
            value={location}
            onChange={handleLocationChange}
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
        <Link href="/orders" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap">Orders</Link>
        <Link href="/impact" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors whitespace-nowrap border border-emerald-100">
          <Leaf className="w-3 h-3" />
          My Impact
        </Link>

        <button
          onClick={openCart}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer active:scale-[0.97]"
          title="Open Cart"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Cart</span>
          {totalCount > 0 && (
            <span className="ml-0.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
              {totalCount}
            </span>
          )}
        </button>

        <span className="text-slate-200">|</span>
        <Link href="/seller" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap">Seller Dashboard</Link>
      </div>
    </nav>
  );
}

