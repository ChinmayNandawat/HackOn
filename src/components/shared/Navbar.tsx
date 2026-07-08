"use client";

import Link from 'next/link';
import { Leaf, MapPin, ShoppingBag, ChevronDown, Layers, Tag, BarChart3 } from 'lucide-react';
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

  const isSellerRoute = pathname?.startsWith("/seller");
  const isWarehouseRoute = pathname?.startsWith("/warehouse");

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-[0_2px_15px_-3px_rgba(16,185,129,0.05)] px-4 sm:px-8 lg:px-12 py-3.5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0 font-sans">
      {/* Left side: Logo & Interactive Location Selector */}
      <div className="flex items-center justify-between w-full md:w-auto gap-6 sm:gap-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 hover:opacity-90 transition-opacity shrink-0"
        >
          <img
            src="/logo3.png"
            alt="ReLife Logo"
            className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent">
            ReLife
          </span>
        </Link>

        {/* Location Selector Pill */}
        <div className="flex items-center gap-1.5 bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors shadow-2xs shrink-0">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <select
            className="bg-transparent border-none outline-none font-semibold text-emerald-900 cursor-pointer text-xs"
            value={location}
            onChange={handleLocationChange}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Navigation Links, Actions & Role Switcher */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-5 w-full md:w-auto flex-wrap sm:flex-nowrap">
        {isSellerRoute ? (
          /* Seller Navigation Links */
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/seller/returns"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                pathname === "/seller/returns"
                  ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/70 shadow-2xs"
                  : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Returns Dashboard</span>
            </Link>
            <Link
              href="/seller/listings"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                pathname === "/seller/listings"
                  ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/70 shadow-2xs"
                  : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>My Listings</span>
            </Link>
            <Link
              href="/seller/analytics"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                pathname === "/seller/analytics"
                  ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/70 shadow-2xs"
                  : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Analytics</span>
            </Link>
          </div>
        ) : isWarehouseRoute ? (
          /* Warehouse Staff — hide shopping links & cart */
          null
        ) : (
          /* Buyer Navigation Links & Cart */
          <>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/orders"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 transition-all whitespace-nowrap"
              >
                Orders
              </Link>
              <Link
                href="/impact"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 transition-all whitespace-nowrap"
              >
                <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                My Impact
              </Link>
            </div>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              title="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-2xs">
                  {totalCount}
                </span>
              )}
            </button>
          </>
        )}

        {!isWarehouseRoute && (
          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />
        )}

        {/* Account / Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
            className="flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Hi, Chinmay ({activeRole})</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 text-slate-500 ${
                isDemoMenuOpen ? "-rotate-180" : ""
              }`}
            />
          </button>

          {isDemoMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDemoMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 py-2 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Active Demo Role
                </div>
                <Link
                  href="/"
                  onClick={() => {
                    selectRole("Buyer");
                    setIsDemoMenuOpen(false);
                  }}
                  className={`block px-4 py-2.5 text-xs font-semibold mx-1.5 rounded-xl transition-colors ${
                    activeRole === "Buyer"
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Buyer Account
                </Link>
                <Link
                  href="/seller"
                  onClick={() => {
                    selectRole("Seller");
                    setIsDemoMenuOpen(false);
                  }}
                  className={`block px-4 py-2.5 text-xs font-semibold mx-1.5 rounded-xl mt-0.5 transition-colors ${
                    activeRole === "Seller"
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Seller Dashboard
                </Link>
                <Link
                  href="/warehouse"
                  onClick={() => {
                    selectRole("Warehouse");
                    setIsDemoMenuOpen(false);
                  }}
                  className={`block px-4 py-2.5 text-xs font-semibold mx-1.5 rounded-xl mt-0.5 transition-colors ${
                    activeRole === "Warehouse"
                      ? "bg-amber-50 text-amber-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
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

