"use client";

import Link from 'next/link';
import { Leaf, MapPin, ShoppingBag, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai"];

export type ActiveRole = 'Buyer' | 'Seller' | 'Warehouse';

export const ROLE_STORAGE_KEY = 'relife_active_role';

/**
 * Derives the Active_Role_Label from a pathname's route prefix alone.
 * Returns `null` for shared routes where the prefix doesn't determine a role
 * (e.g. `/orders`, `/impact`, `/`).
 */
export function deriveRoleFromPath(pathname: string): ActiveRole | null {
  if (pathname.startsWith('/warehouse')) return 'Warehouse';
  if (pathname.startsWith('/seller')) return 'Seller';
  return null;
}

/**
 * Pure persistence reducer for the Active_Role_Label.
 * - An explicit selection (clicking a Role_Switcher option) always wins.
 * - Otherwise, if the pathname's prefix determines a role, that role wins.
 * - Otherwise (a shared route with no explicit selection), the previous role is kept.
 */
export function resolveActiveRole(
  prevRole: ActiveRole,
  pathname: string,
  explicitSelection: ActiveRole | null
): ActiveRole {
  if (explicitSelection !== null) return explicitSelection;
  const derived = deriveRoleFromPath(pathname);
  if (derived !== null) return derived;
  return prevRole;
}

export default function Navbar() {
  const [location, setLocation] = useState<string>("Mumbai"); // Default
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();
  const pathname = usePathname();

  const [activeRole, setActiveRole] = useState<ActiveRole>(() => {
    if (typeof window === 'undefined') {
      return deriveRoleFromPath(pathname ?? '') ?? 'Buyer';
    }
    return (
      deriveRoleFromPath(pathname ?? '') ??
      (localStorage.getItem(ROLE_STORAGE_KEY) as ActiveRole | null) ??
      'Buyer'
    );
  });

  useEffect(() => {
    const derived = deriveRoleFromPath(pathname ?? '');
    if (derived !== null) {
      setActiveRole(derived);
      localStorage.setItem(ROLE_STORAGE_KEY, derived);
    }
  }, [pathname]);

  const selectRole = (role: ActiveRole) => {
    setActiveRole(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  };

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
      <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap pb-1 md:pb-0">
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
        
        <div className="relative">
          <button 
            onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap py-1"
          >
            Hi, Chinmay ({activeRole})
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 text-slate-500 ${isDemoMenuOpen ? '-rotate-180' : ''}`} />
          </button>
          
          {isDemoMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDemoMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-200/50 py-1.5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Demo Accounts
                </div>
                <Link 
                  href="/" 
                  onClick={() => {
                    selectRole('Buyer');
                    setIsDemoMenuOpen(false);
                  }}
                  className={`block px-3 py-2 text-xs font-medium mx-1.5 rounded-md transition-colors ${activeRole === 'Buyer' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  Buyer Account
                </Link>
                <Link 
                  href="/seller" 
                  onClick={() => {
                    selectRole('Seller');
                    setIsDemoMenuOpen(false);
                  }}
                  className={`block px-3 py-2 text-xs font-medium mx-1.5 rounded-md mt-0.5 transition-colors ${activeRole === 'Seller' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  Seller Dashboard
                </Link>
                <Link 
                  href="/warehouse" 
                  onClick={() => {
                    selectRole('Warehouse');
                    setIsDemoMenuOpen(false);
                  }}
                  className={`block px-3 py-2 text-xs font-medium mx-1.5 rounded-md mt-0.5 transition-colors ${activeRole === 'Warehouse' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  Warehouse Staff
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

