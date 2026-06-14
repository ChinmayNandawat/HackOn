"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Return Submitted!</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Our AI has pre-approved your photos for quality. We will now begin processing your return and AI grading check.
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition shadow-sm w-full"
        >
          Back to Store
        </Link>
      </div>
    </main>
  );
}
