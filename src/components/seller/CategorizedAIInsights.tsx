"use client";

import React, { useState } from "react";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight, Layers, Smartphone, Shirt, Footprints, ShieldAlert } from "lucide-react";

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
    aiRecommendation: "Optional Idea: Some merchants reduce sizing returns by adding a brief note in the description (e.g., 'Sleeves run ~1 inch shorter than standard fit'). You can implement this or adjust your size chart as you see fit.",
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
    aiRecommendation: "Optional Idea: Some sellers reduce cosmetic transit claims by using reinforced bubble padding for Grade A refurbished listings. You can evaluate your warehouse packaging specifications if appropriate.",
    severity: "medium",
    buttonText: "Optional: Update packaging specifications",
    appliedText: "✅ Packaging specifications updated",
  },
  {
    id: "sku-209",
    category: "footwear",
    sku: "SKU #209",
    productName: "Puma RS-X Retro Chunky Sneakers",
    returnRate: "4%",
    alertTitle: "Fit Risk Successfully Mitigated on SKU #209",
    rootCause: "AI Fit Analyzer detected narrow toe box profile across customer reviews.",
    aiRecommendation: "Optional Idea: Our AI Fit Advisor can automatically suggest buyers size up +0.5 size based on review feedback. You can keep this automated fit rule enabled or adjust your sizing guidelines as you see fit.",
    severity: "optimization",
    buttonText: "✅ Automated Fit Rule Enabled",
    appliedText: "✅ Automated Fit Rule Enabled",
    isInitiallyApplied: true,
  },
  {
    id: "sku-118",
    category: "apparel",
    sku: "SKU #118",
    productName: "H&M Relaxed Linen Blend Dress",
    returnRate: "11%",
    alertTitle: "Color Perception Variance on SKU #118",
    rootCause: "3 buyers mentioned olive fabric appears slightly darker in indoor room lighting.",
    aiRecommendation: "Optional Idea: Some merchants reduce color perception returns by featuring outdoor sunlight photographs as the primary thumbnail. You can reorder your gallery photos if you feel it represents the color better.",
    severity: "medium",
    buttonText: "Optional: Set sunlight photo as primary",
    appliedText: "✅ Sunlight photo set as primary",
  },
];

export default function CategorizedAIInsights() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({
    "sku-209": true,
  });

  const toggleSuggestion = (id: string) => {
    setOpenSuggestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyFix = (id: string) => {
    setAppliedFixes((prev) => ({ ...prev, [id]: true }));
  };

  const filteredInsights = activeTab === "all"
    ? initialInsights
    : initialInsights.filter((item) => item.category === activeTab);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mt-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-200 shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Root Cause Analysis & Diagnostic Insights
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Diagnostic AI
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Objective, category-grouped diagnostic analysis of return triggers with optional, non-intrusive AI suggestions for your consideration.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Categories ({initialInsights.length})
          </button>
          <button
            onClick={() => setActiveTab("apparel")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "apparel"
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Apparel ({initialInsights.filter((i) => i.category === "apparel").length})
          </button>
          <button
            onClick={() => setActiveTab("electronics")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "electronics"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Electronics ({initialInsights.filter((i) => i.category === "electronics").length})
          </button>
          <button
            onClick={() => setActiveTab("footwear")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "footwear"
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Footwear ({initialInsights.filter((i) => i.category === "footwear").length})
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInsights.map((item) => {
          const isApplied = appliedFixes[item.id];
          const isOpen = openSuggestions[item.id] || false;

          // Severity styles
          const severityBadge = {
            high: "bg-red-50 text-red-700 border-red-200",
            medium: "bg-amber-50 text-amber-800 border-amber-200",
            optimization: "bg-blue-50 text-blue-700 border-blue-200",
          }[item.severity];

          const severityLabel = {
            high: "⚠️ High Priority Alert",
            medium: "💡 Medium Alert",
            optimization: "✨ Active Mitigation",
          }[item.severity];

          const borderStyle = {
            high: "border-red-200 hover:border-red-300",
            medium: "border-amber-200 hover:border-amber-300",
            optimization: "border-blue-200 hover:border-blue-300",
          }[item.severity];

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-6 transition-all duration-200 flex flex-col justify-between ${borderStyle} ${
                isApplied && !item.isInitiallyApplied ? "bg-emerald-50/30 border-emerald-300 shadow-sm" : "bg-slate-50/50 hover:shadow-md"
              }`}
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    {item.category === "apparel" && <Shirt className="w-3.5 h-3.5 text-indigo-500" />}
                    {item.category === "electronics" && <Smartphone className="w-3.5 h-3.5 text-blue-500" />}
                    {item.category === "footwear" && <Footprints className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{item.category.toUpperCase()} • {item.sku}</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${severityBadge}`}>
                    {severityLabel}
                  </span>
                </div>

                {/* Product Title */}
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  {item.productName}
                </h3>

                {/* Root Cause Alert Box - Prominent & Diagnostic */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 mt-3 shadow-2xs">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 block mb-1.5 tracking-wider">
                    Root Cause Analysis ({item.returnRate} Return Rate)
                  </span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {item.rootCause}
                  </p>
                </div>
              </div>

              {/* Opt-In Suggestion Section */}
              <div className="mt-5 pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => toggleSuggestion(item.id)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200/80 shadow-2xs cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isOpen ? "💡 Hide Optional AI Suggestion ▴" : "💡 View Optional AI Suggestion ▾"}</span>
                </button>

                {isOpen && (
                  <div className="mt-3 bg-slate-100/70 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Suggestion for your consideration</span>
                    </div>
                    <p className="font-medium text-slate-600 leading-relaxed">
                      {item.aiRecommendation}
                    </p>
                    {item.buttonText && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 italic">You remain in full control of your listings</span>
                        <button
                          type="button"
                          onClick={() => handleApplyFix(item.id)}
                          disabled={isApplied}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isApplied
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default"
                              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs hover:border-slate-400 cursor-pointer"
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{item.appliedText || "Applied"}</span>
                            </>
                          ) : (
                            <span>{item.buttonText}</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
