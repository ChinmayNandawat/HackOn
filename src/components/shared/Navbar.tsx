"use client";

import Link from 'next/link';
import { Leaf, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai"];

export default function Navbar() {
  const [location, setLocation] = useState<string>("Mumbai"); // Default

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
    <nav className="border-b bg-white p-3 sm:p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-3 md:gap-0">
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          ReLife
        </Link>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
          <select 
            className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer"
            value={location}
            onChange={handleLocationChange}
          >
            {CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
        {/* Buyer Links */}
        <Link href="/orders" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap">Orders</Link>
        <Link href="/impact" className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors whitespace-nowrap">
          <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
          My Impact
        </Link>
        <span className="text-slate-300 ml-1 sm:ml-2">|</span>
        {/* Seller Links */}
        <Link href="/seller" className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap">Seller Dashboard</Link>
      </div>
    </nav>
  );
}
