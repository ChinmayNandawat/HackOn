"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-[#0F766E] dark:text-teal-400 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Return Confirmed & Driver Dispatched!</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm font-medium">
          Our AI has verified your condition. Please present the item to your courier when they arrive for immediate doorstep hand-back and instant refund override.
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-3.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-2xs w-full"
        >
          Back to Store
        </Link>
      </div>
    </main>
  );
}
