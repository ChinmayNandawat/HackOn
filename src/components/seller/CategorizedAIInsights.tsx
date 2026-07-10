"use client";

import React, { useState } from "react";
import { Sparkles, Shirt, Smartphone, Footprints, ChevronDown, ChevronUp, CheckCircle2, Lightbulb } from "lucide-react";

type CategoryTab = "all" | "apparel" | "electronics" | "footwear";

interface InsightItem {
  id: string;
  category: "apparel" | "electronics" | "footwear";
  sku: string;
  productName: string;
  returnRate: string;
  alertTitle: string;
  rootCause: string;
  aiRecommendation: string;
  severity: "high" | "medium" | "optimization";
  buttonText: string;
  appliedText: string;
  isInitiallyApplied?: boolean;
}

const initialInsights: InsightItem[] = [
  {
    id: "sku-104",
    category: "apparel",
    sku: "SKU #104",
    productName: "Vintage Denim Wash Jacket",
    returnRate: "18%",
    alertTitle: "High Return Rate (18%) on SKU #104",
    rootCause: "70% of buyers cite 'Sleeve length too short' after trying on.",
    aiRecommendation: "Some merchants reduce sizing returns by adding a brief note in the description (e.g., 'Sleeves run ~1 inch shorter than standard fit'). You can implement this or adjust your size chart as you see fit.",
    severity: "high",
    buttonText: "Optional: Add sizing note to description",
    appliedText: "✅ Sizing note added to listing",
  },
  {
    id: "sku-302",
    category: "electronics",
    sku: "SKU #302",
    productName: "Refurbished Wireless Earbuds Pro",
    returnRate: "8%",
    alertTitle: "Packaging Alert on SKU #302",
    rootCause: "2 returns reported minor transit scuffs on the outer charging case.",
    aiRecommendation: "Some sellers reduce cosmetic transit claims by using reinforced bubble padding for Grade A refurbished listings. You can evaluate your warehouse packaging specifications if appropriate.",
    severity: "medium",
    buttonText: "Optional: Update packaging specifications",
    appliedText: "✅ Packaging specifications updated",
  },
  {
    id: "sku-118",
    category: "apparel",
    sku: "SKU #118",
    productName: "H&M Relaxed Linen Blend Dress",
    returnRate: "11%",
    alertTitle: "Color Perception Variance on SKU #118",
    rootCause: "3 buyers mentioned olive fabric appears slightly darker in indoor room lighting.",
    aiRecommendation: "Some merchants reduce color perception returns by featuring outdoor sunlight photographs as the primary thumbnail. You can reorder your gallery photos if you feel it represents the color better.",
    severity: "medium",
    buttonText: "Optional: Set sunlight photo as primary",
    appliedText: "✅ Sunlight photo set as primary",
  },
  {
    id: "sku-209",
    category: "footwear",
    sku: "SKU #209",
    productName: "Puma RS-X Retro Chunky Sneakers",
    returnRate: "4%",
    alertTitle: "Fit Risk Successfully Mitigated on SKU #209",
    rootCause: "AI Fit Analyzer detected narrow toe box profile across customer reviews.",
    aiRecommendation: "Our AI Fit Advisor can automatically suggest buyers size up +0.5 size based on review feedback. You can keep this automated fit rule enabled or adjust your sizing guidelines as you see fit.",
    severity: "optimization",
    buttonText: "✅ Automated Fit Rule Enabled",
    appliedText: "✅ Automated Fit Rule Enabled",
    isInitiallyApplied: true,
  }
];

export default function CategorizedAIInsights() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});

  const toggleSuggestion = (id: string) => {
    setOpenSuggestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredInsights = activeTab === "all"
    ? initialInsights
    : initialInsights.filter((item) => item.category === activeTab);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-8 overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                Root Cause Analysis
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Diagnostic AI
                </span>
              </h2>
              <p className="text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
                Clear, category-grouped diagnostics for product returns. Expand any issue to see ReLife suggestions.
              </p>
            </div>
          </div>

          {/* Minimal Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl self-start md:self-center border border-slate-200 shadow-sm text-sm font-bold mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === "all" ? "bg-emerald-600 text-white shadow-xs font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("apparel")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "apparel" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Shirt className="w-4 h-4" /> Apparel
            </button>
            <button
              onClick={() => setActiveTab("electronics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "electronics" ? "bg-teal-50 text-teal-800 border border-teal-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Smartphone className="w-4 h-4" /> Electronics
            </button>
            <button
              onClick={() => setActiveTab("footwear")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === "footwear" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Footprints className="w-4 h-4" /> Footwear
            </button>
          </div>
        </div>
      </div>

      {/* Clean List Layout */}
      <div className="divide-y divide-slate-100">
        {filteredInsights.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No insights available for this category yet.</div>
        ) : (
          filteredInsights.map((item) => {
            const isOpen = openSuggestions[item.id] || false;

            const categoryIcon = {
              apparel: <Shirt className="w-4 h-4 text-emerald-600" />,
              electronics: <Smartphone className="w-4 h-4 text-teal-600" />,
              footwear: <Footprints className="w-4 h-4 text-emerald-600" />
            }[item.category];

            const categoryBg = {
              apparel: "bg-emerald-50 border-emerald-200 text-emerald-800",
              electronics: "bg-teal-50 border-teal-200 text-teal-800",
              footwear: "bg-emerald-50 border-emerald-200 text-emerald-800"
            }[item.category];

            const severityBadge = {
              high: "bg-red-50 text-red-700 border-red-200",
              medium: "bg-amber-50 text-amber-800 border-amber-200",
              optimization: "bg-emerald-50 text-emerald-800 border-emerald-200",
            }[item.severity];

            const severityLabel = {
              high: "High",
              medium: "Medium",
              optimization: "Mitigated",
            }[item.severity];

            const returnRateBg = {
              high: "bg-red-50 text-red-700 border-red-200",
              medium: "bg-amber-50 text-amber-700 border-amber-200",
              optimization: "bg-emerald-50 text-emerald-700 border-emerald-200",
            }[item.severity];

            return (
              <div key={item.id} className={`transition-colors ${isOpen ? "bg-slate-50/50" : "hover:bg-slate-50/30"}`}>
                {/* Main Row (Clickable) */}
                <div
                  className="p-6 md:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer select-none group"
                  onClick={() => toggleSuggestion(item.id)}
                >
                  {/* Left: Return Rate & Product Info */}
                  <div className="flex items-center gap-5 lg:w-[45%] shrink-0">
                    <div className={`flex flex-col items-center justify-center py-2.5 px-4 rounded-xl min-w-[85px] shrink-0 border shadow-sm ${returnRateBg}`}>
                      <span className="text-2xl md:text-3xl font-black tracking-tight">{item.returnRate}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80 mt-0.5">Returns</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${categoryBg}`}>
                          {categoryIcon}
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2" title={item.productName}>
                        {item.productName}
                      </h3>
                    </div>
                  </div>

                  {/* Middle: Root Cause Summary */}
                  <div className="lg:flex-1 lg:pl-6 border-l-0 lg:border-l border-slate-200">
                    <p className="text-base text-slate-700 font-medium leading-relaxed">
                      "{item.rootCause}"
                    </p>
                  </div>

                  {/* Right: Status & Suggestion Icon */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 lg:w-32 shrink-0">
                    <div className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg border shadow-2xs min-w-[70px] ${severityBadge}`}>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest opacity-70 mb-0.5">
                        {item.severity === 'optimization' ? 'Status' : 'Priority'}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider leading-none">
                        {severityLabel}
                      </span>
                    </div>
                    <button 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors shadow-sm ${
                        isOpen 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : "bg-white border-slate-200 text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700"
                      }`}
                      title="View ReLife Suggestion"
                    >
                      <Lightbulb className={`w-5 h-5 ${isOpen ? "fill-white" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded AI Suggestion */}
                {isOpen && (
                  <div className="px-6 md:px-8 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-5 bg-emerald-50/40 border-emerald-200 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 mb-3">
                          <Lightbulb className="w-5 h-5" />
                          <span className="text-base">ReLife Suggestion</span>
                        </div>
                        <p className="text-base text-slate-600 font-medium leading-relaxed max-w-4xl">
                          {item.aiRecommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
