"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Tag, BarChart3, Sparkles, ShieldCheck, ArrowDownRight } from "lucide-react";

export default function SellerNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Returns Dashboard & Automated Override", href: "/seller/returns", icon: Layers },
    { name: "Circular Inventory & Listings", href: "/seller/listings", icon: Tag },
    { name: "AI ROI & Reduction Analytics", href: "/seller/analytics", icon: BarChart3 },
  ];

  return (
    <div className="mb-8 font-sans space-y-6">
      {/* Clean SaaS Header (Stripe/Linear style) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 font-bold text-xs border border-teal-200/60 dark:border-teal-800/50 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Reverse Logistics & Automated Grading</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Seller Studio • Return Analytics & Automation
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage 100-point AI computer vision inspections, configure automated refund rules for verified buyers, and divert returned inventory directly to circular resale feeds without manual touchpoints.
          </p>
        </div>

        {/* Right Benchmark Summary Cards */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-4 rounded-xl flex flex-col justify-center min-w-[180px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Return Rate</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" /> -65%
              </span>
            </div>
            <div className="text-slate-900 dark:text-white font-black text-2xl flex items-baseline gap-1.5 mt-1">
              <span>4.2%</span>
              <span className="text-xs text-slate-500 font-semibold">(vs 12% avg)</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-4 rounded-xl flex flex-col justify-center min-w-[180px]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Automated Resolution</span>
            <div className="text-slate-900 dark:text-white font-black text-2xl flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-6 h-6 text-[#0F766E] dark:text-teal-400 shrink-0" />
              <span>98.4%</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Zero manual touchpoints</span>
          </div>
        </div>
      </div>

      {/* Sleek Minimalist Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-fit">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                isActive 
                  ? "bg-[#0F766E] text-white shadow-2xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
