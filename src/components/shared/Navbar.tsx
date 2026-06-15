import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-slate-900">
        ReLife
      </Link>
      <div className="flex items-center gap-4">
        {/* Buyer Links */}
        <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">Orders</Link>
        <Link href="/impact" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
          <Leaf className="w-4 h-4" />
          My Impact
        </Link>
        <span className="text-slate-300 ml-2">|</span>
        {/* Seller Links */}
        <Link href="/seller" className="text-sm font-medium text-blue-600 hover:text-blue-800">Seller Dashboard</Link>
      </div>
    </nav>
  );
}
