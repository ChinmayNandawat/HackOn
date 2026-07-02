"use client";

import React from "react";
import { useSellerAutomation } from "@/context/SellerAutomationContext";
import { ReturnWithProduct } from "@/types/database";
import { Bot, Zap, ShieldCheck, Clock, Sliders, CheckCircle2, AlertTriangle } from "lucide-react";

interface AutomatedOverrideCardProps {
  returns?: ReturnWithProduct[];
}

export default function AutomatedOverrideCard({ returns = [] }: AutomatedOverrideCardProps) {
  const { rules, setEnabled, setMaxItemValue, setMinTrustScore, isReturnAutoApproved } = useSellerAutomation();

  // Calculate real-time impact metrics
  // Count returns that were actually auto-approved
  const autoApprovedCount = returns.filter((r) => r.flaws_json?.auto_approved === true).length;
  // Estimate pending auto-approvals
  const pendingReturns = returns.filter((r) => r.status === "processing");
  const pendingAutoApproveCount = pendingReturns.filter((r) => isReturnAutoApproved(r)).length;
  
  const totalAutoCount = autoApprovedCount + pendingAutoApproveCount;
  const hoursSaved = (totalAutoCount * 0.4).toFixed(1); // Assume 24 mins (~0.4 hr) saved per return
  const usdVal = Math.round(rules.maxItemValue / 83);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 relative transition-all duration-300">
      {/* Header & Toggle Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6 mb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                Automated Grading & Refund Override
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                AI Engine
              </span>
            </div>
            <p className="text-sm text-slate-600 font-medium mt-1 max-w-xl">
              Save hours of manual inspection by automatically approving low-value returns from trusted, high-volume buyers.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center gap-3 self-start md:self-center bg-gray-100 px-4 py-2.5 rounded-lg border border-slate-200">
          <span className={`text-xs font-bold uppercase tracking-wider ${rules.enabled ? "text-emerald-600" : "text-slate-500"}`}>
            {rules.enabled ? "Active" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={() => setEnabled(!rules.enabled)}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 focus:outline-none ${
              rules.enabled ? "bg-emerald-500 shadow-sm" : "bg-gray-400"
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${
                rules.enabled ? "translate-x-6" : "translate-x-0"
              }`}
            >
              {rules.enabled && <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 animate-bounce" />}
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 transition-opacity duration-300 ${rules.enabled ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
        {/* Slider: Item Value Threshold */}
        <div className="bg-gray-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Max Item Value Threshold
            </label>
            <span className="text-lg font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              ₹{rules.maxItemValue.toLocaleString("en-IN")} <span className="text-xs text-emerald-600 font-medium">(~${usdVal})</span>
            </span>
          </div>
          
          <input
            type="range"
            min={0}
            max={25000}
            step={500}
            value={rules.maxItemValue}
            onChange={(e) => setMaxItemValue(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          
          <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-semibold">
            <span>₹0 ($0)</span>
            <span>₹10,000 (~$120)</span>
            <span>₹25,000 (~$300)</span>
          </div>
        </div>

        {/* Dropdown: Minimum Trust Score */}
        <div className="bg-gray-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <label className="text-sm font-bold text-slate-500 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Minimum Buyer Trust Score
            </label>
            <select
              value={rules.minTrustScore}
              onChange={(e) => setMinTrustScore(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value={60}>60% — Medium Trust & Above</option>
              <option value={70}>70% — Medium-High Trust</option>
              <option value={80}>80% — High Trust (Recommended)</option>
              <option value={85}>85% — High Trust Only</option>
              <option value={90}>90% — Ultra High Trust VIPs</option>
            </select>
          </div>
          
          <p className="text-xs text-slate-600 mt-2 font-medium">
            Evaluates buyer order frequency, historical return rate, and delivery timing.
          </p>
        </div>
      </div>

      {/* Live Rule Preview Box */}
      <div className={`mt-6 p-4 rounded-xl border relative z-10 transition-all ${
        rules.enabled
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-gray-50 border-slate-200"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${rules.enabled ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              <span className="font-extrabold text-slate-900">Rule Preview: </span>
              Automatically approve return & issue instant refund if Item Value is under{" "}
              <span className="font-bold text-emerald-600 underline decoration-emerald-500">₹{rules.maxItemValue.toLocaleString("en-IN")} (~${usdVal})</span>{" "}
              AND Buyer Trust Score is above{" "}
              <span className="font-bold text-amber-600 underline decoration-amber-500">{rules.minTrustScore}%</span>.
            </p>
          </div>

          {/* Real-time Impact Metric */}
          {rules.enabled && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-emerald-600 text-xs font-bold whitespace-nowrap self-start md:self-center">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>
                Auto-approved <strong className="text-emerald-700 font-black">{totalAutoCount}</strong> returns (~{hoursSaved} hrs saved)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
