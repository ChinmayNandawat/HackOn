"use client";

import React, { useState } from "react";
import { TrendingDown, Sparkles, DollarSign, ShieldCheck, CheckCircle2, ArrowDownRight, Info } from "lucide-react";

interface MonthlyData {
  month: string;
  yourRate: number; // percentage e.g. 18.5
  platformAvg: number; // percentage e.g. 15.2
  returnsAvoided: number;
  savingsInr: number;
  note?: string;
}

const data: MonthlyData[] = [
  { month: "Jan", yourRate: 18.5, platformAvg: 15.2, returnsAvoided: 0, savingsInr: 0 },
  { month: "Feb", yourRate: 17.8, platformAvg: 14.9, returnsAvoided: 2, savingsInr: 1000 },
  { month: "Mar", yourRate: 16.2, platformAvg: 15.1, returnsAvoided: 6, savingsInr: 3000 },
  { month: "Apr", yourRate: 11.4, platformAvg: 14.8, returnsAvoided: 18, savingsInr: 9000, note: "✨ AI Cart Size Advisor Enabled" },
  { month: "May", yourRate: 8.6, platformAvg: 15.0, returnsAvoided: 29, savingsInr: 14500 },
  { month: "Jun", yourRate: 6.2, platformAvg: 14.7, returnsAvoided: 38, savingsInr: 19000, note: "⚡ Automated Overrides Activated" },
];

export default function ReturnReductionROIGraph() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // Default to latest month (Jun)
  const activeData = data[selectedMonthIndex];

  // Graph dimensions
  const width = 800;
  const height = 240;
  const maxRate = 22; // max Y axis percentage

  const getX = (index: number) => (index / (data.length - 1)) * (width - 100) + 50;
  const getY = (val: number) => height - (val / maxRate) * (height - 40) - 20;

  const yourRatePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)},${getY(d.yourRate)}`)
    .join(" ");
  
  const yourRateAreaPath = `${yourRatePath} L ${getX(data.length - 1)},${height} L ${getX(0)},${height} Z`;

  const platformAvgPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)},${getY(d.platformAvg)}`)
    .join(" ");

  const totalSavingsInr = data.reduce((acc, curr) => acc + curr.savingsInr, 0);
  const totalAvoided = data.reduce((acc, curr) => acc + curr.returnsAvoided, 0);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl border border-indigo-500/30 p-6 md:p-8 mb-8 relative overflow-hidden transition-all duration-300">
      {/* Background glow effects */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-6 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300 shadow-inner">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Return Reduction Proof & ROI Graph
            </h2>
          </div>
          <p className="text-sm text-indigo-200/80 mt-1">
            Your Return Rate vs. Platform Average over the past 6 months since enabling AI tools.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 self-start md:self-center bg-slate-800/60 px-4 py-2 rounded-xl border border-indigo-500/20 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="text-emerald-300">Your Return Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span>
            <span className="text-slate-400">Platform Avg (~15%)</span>
          </div>
        </div>
      </div>

      {/* Bold Stat Callout Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400 flex-shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
              Impact Proof
            </span>
            <p className="text-sm font-black text-white leading-tight">
              Returns Reduced by 66% since enabling AI Cart Size Advisor
            </p>
          </div>
        </div>

        <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-300 flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
              Net Cost Savings
            </span>
            <p className="text-sm font-black text-white leading-tight">
              ₹{totalSavingsInr.toLocaleString("en-IN")} (~${Math.round(totalSavingsInr / 83)} USD) saved in logistics
            </p>
          </div>
        </div>

        <div className="bg-purple-950/60 border border-purple-500/40 rounded-xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-300 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 block">
              Fit Satisfaction
            </span>
            <p className="text-sm font-black text-white leading-tight">
              94.2% Buyer Fit Score ({totalAvoided} returns prevented)
            </p>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-6 relative z-10 backdrop-blur-sm">
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible">
            <defs>
              <linearGradient id="yourRateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[5, 10, 15, 20].map((val) => (
              <g key={val}>
                <line
                  x1="50"
                  y1={getY(val)}
                  x2={width - 50}
                  y2={getY(val)}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x="35"
                  y={getY(val) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                  fontWeight="bold"
                >
                  {val}%
                </text>
              </g>
            ))}

            {/* Area Fill under Your Rate */}
            <path d={yourRateAreaPath} fill="url(#yourRateGrad)" />

            {/* Platform Avg Line (Dashed Gray) */}
            <path
              d={platformAvgPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />

            {/* Your Rate Line (Solid Emerald) */}
            <path
              d={yourRatePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points and Interaction Circles */}
            {data.map((d, i) => {
              const cx = getX(i);
              const cyYour = getY(d.yourRate);
              const cyAvg = getY(d.platformAvg);
              const isSelected = selectedMonthIndex === i;

              return (
                <g key={i} className="cursor-pointer" onClick={() => setSelectedMonthIndex(i)}>
                  {/* Hover vertical line */}
                  {isSelected && (
                    <line
                      x1={cx}
                      y1="0"
                      x2={cx}
                      y2={height}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Platform Avg Point */}
                  <circle
                    cx={cx}
                    cy={cyAvg}
                    r="4"
                    fill="#94a3b8"
                    className="transition-all duration-200 hover:r-6"
                  />

                  {/* Your Rate Point */}
                  <circle
                    cx={cx}
                    cy={cyYour}
                    r={isSelected ? "8" : "5"}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all duration-200 hover:r-8 shadow-lg"
                  />

                  {/* Month Label */}
                  <text
                    x={cx}
                    y={height + 18}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={isSelected ? "900" : "bold"}
                    fill={isSelected ? "#38bdf8" : "#94a3b8"}
                  >
                    {d.month}
                  </text>

                  {/* Value Label above Point */}
                  <text
                    x={cx}
                    y={cyYour - 12}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="black"
                    fill={isSelected ? "#34d399" : "#ffffff"}
                  >
                    {d.yourRate}%
                  </text>
                </g>
              );
            })}

            {/* Annotation Badge for Month 4 (Apr) AI Enablement */}
            <g transform={`translate(${getX(3) - 80}, ${getY(data[3].yourRate) - 45})`}>
              <rect width="160" height="26" rx="6" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
              <text x="80" y="17" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#a7f3d0">
                ✨ AI Cart Advisor Enabled
              </text>
            </g>
          </svg>
        </div>

        {/* Selected Month Detail Box */}
        <div className="mt-8 pt-6 border-t border-indigo-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30 text-indigo-300">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-indigo-300 font-bold block">
                Selected Month Analysis: <strong className="text-white text-sm">{activeData.month}</strong>
              </span>
              <p className="text-sm text-gray-300 mt-0.5 font-medium">
                Your Return Rate was <strong className="text-emerald-400 font-extrabold">{activeData.yourRate}%</strong> vs. Platform Average of <strong className="text-slate-400 font-bold">{activeData.platformAvg}%</strong>.
                {activeData.note && <span className="ml-2 text-amber-300 font-bold">{activeData.note}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-center bg-slate-800 px-4 py-2.5 rounded-xl border border-indigo-500/20 text-xs">
            <div>
              <span className="text-gray-400 block font-semibold">Returns Avoided:</span>
              <span className="text-sm font-black text-white">+{activeData.returnsAvoided} items</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-gray-400 block font-semibold">Cost Savings:</span>
              <span className="text-sm font-black text-emerald-400">₹{activeData.savingsInr.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
