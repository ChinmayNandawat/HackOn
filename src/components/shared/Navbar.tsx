import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b bg-white p-4 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-slate-900">
        ReLife
      </Link>
      <div className="flex gap-4">
        {/* Buyer Links */}
        <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">Orders</Link>
        <Link href="/impact" className="text-sm font-medium text-slate-600 hover:text-slate-900">Impact</Link>
        <span className="text-slate-300">|</span>
        {/* Seller Links */}
        <Link href="/seller" className="text-sm font-medium text-blue-600 hover:text-blue-800">Seller Dashboard</Link>
      </div>
    </nav>
  );
}
