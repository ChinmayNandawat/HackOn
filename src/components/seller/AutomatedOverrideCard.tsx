"use client";

import React from "react";
import { useSellerAutomation } from "@/context/SellerAutomationContext";
import { ReturnWithProduct } from "@/types/database";
import { Bot, Zap, ShieldCheck, Clock, Sliders, CheckCircle2, Sparkles } from "lucide-react";

interface AutomatedOverrideCardProps {
  returns?: ReturnWithProduct[];
}

export default function AutomatedOverrideCard({ returns = [] }: AutomatedOverrideCardProps) {
  const { rules, setEnabled, setMaxItemValue, setMinTrustScore, isReturnAutoApproved } = useSellerAutomation();

  const pendingReturns = returns.filter((r) => r.status === "processing");
  const autoApprovedCount = pendingReturns.filter((r) => isReturnAutoApproved(r)).length;
  const hoursSaved = (autoApprovedCount * 0.4).toFixed(1);
  const usdVal = Math.round(rules.maxItemValue / 83);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xs font-sans space-y-6 transition-all">
      
      {/* Header & Master Toggle Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/50 rounded-xl text-[#0F766E] dark:text-teal-400 shadow-2xs shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Automatic Instant Refunds
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/80 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs">
                Auto-Refund Rules
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Automatically approve refunds for trusted buyers when the item value is below your set limit.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center gap-3 self-start md:self-center bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <span className={`text-xs font-bold uppercase tracking-wider ${rules.enabled ? "text-[#0F766E] dark:text-teal-400" : "text-slate-400"}`}>
            {rules.enabled ? "Automation Active" : "Automation Disabled"}
          </span>
          <button
            type="button"
            onClick={() => setEnabled(!rules.enabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
              rules.enabled ? "bg-[#0F766E]" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 flex items-center justify-center ${
                rules.enabled ? "translate-x-6" : "translate-x-0"
              }`}
            >
              {rules.enabled && <CheckCircle2 className="w-2.5 h-2.5 text-[#0F766E]" />}
            </div>
          </button>
        </div>
      </div>

      {/* Conversational Explanation Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 sm:p-5 text-slate-800 dark:text-slate-200 shadow-2xs flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#0F766E] dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
            Automatically approve returns under <span className="text-[#0F766E] dark:text-teal-400 font-black">₹{rules.maxItemValue.toLocaleString("en-IN")} (~${usdVal} USD)</span> when a customer has a verified trust score of <span className="text-[#0F766E] dark:text-teal-400 font-black">{rules.minTrustScore}% or higher</span>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When triggered, our courier verifies item condition at the buyer&apos;s doorstep via AI camera scan and initiates an immediate refund.
          </p>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${rules.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        
        {/* Slider: Item Value Threshold */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0F766E]" />
              <span>Max Item Value Threshold</span>
            </label>
            <span className="text-sm sm:text-base font-black text-[#0F766E] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
              ₹{rules.maxItemValue.toLocaleString("en-IN")} <span className="text-xs text-slate-500 font-medium">(~${usdVal})</span>
            </span>
          </div>
          
          <input
            type="range"
            min={0}
            max={25000}
            step={500}
            value={rules.maxItemValue}
            onChange={(e) => setMaxItemValue(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
          />
          
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>₹0 ($0)</span>
            <span>₹10,000 (~$120)</span>
            <span>₹25,000 (~$300)</span>
          </div>
        </div>

        {/* Dropdown: Minimum Trust Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Minimum Buyer Trust Score Requirement</span>
            </label>
            <select
              value={rules.minTrustScore}
              onChange={(e) => setMinTrustScore(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-[#0F766E] transition cursor-pointer shadow-2xs"
            >
              <option value={60}>60% — Medium Trust & Above</option>
              <option value={70}>70% — Medium-High Trust</option>
              <option value={80}>80% — High Trust VIPs (Recommended)</option>
              <option value={85}>85% — High Trust Only</option>
              <option value={90}>90% — Ultra High Trust Prime VIPs</option>
            </select>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span>Evaluates buyer order frequency, past return velocity, and delivery timing.</span>
          </p>
        </div>
      </div>

      {/* Real-time Impact Callout */}
      {rules.enabled && (
        <div className="bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Zap className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>
              Real-time Queue Impact: Auto-approving <strong className="text-[#0F766E] dark:text-teal-400 font-black">{autoApprovedCount}</strong> of {pendingReturns.length} pending returns.
            </span>
          </div>
          <span className="font-bold text-[#0F766E] dark:text-teal-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60 shadow-2xs whitespace-nowrap">
            🕒 Approx {hoursSaved} hrs of inspection saved
          </span>
        </div>
      )}
    </div>
  );
}
