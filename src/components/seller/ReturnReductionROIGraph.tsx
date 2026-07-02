"use client";

import React, { useState } from "react";
import { TrendingDown, Sparkles, DollarSign, ShieldCheck, ArrowDownRight, Info } from "lucide-react";

interface MonthlyData {
  month: string;
  yourRate: number; // percentage e.g. 18.5
  platformAvg: number; // percentage e.g. 15.2
  returnsAvoided: number;
  savingsInr: number;
  note?: string;
}

const data: MonthlyData[] = [
  { month: "Jan", yourRate: 18.5, platformAvg: 12.0, returnsAvoided: 0, savingsInr: 0 },
  { month: "Feb", yourRate: 17.8, platformAvg: 12.0, returnsAvoided: 2, savingsInr: 1000 },
  { month: "Mar", yourRate: 16.2, platformAvg: 12.0, returnsAvoided: 6, savingsInr: 3000 },
  { month: "Apr", yourRate: 11.4, platformAvg: 12.0, returnsAvoided: 18, savingsInr: 9000, note: "✨ AI Cart Size Advisor Enabled" },
  { month: "May", yourRate: 8.6, platformAvg: 12.0, returnsAvoided: 29, savingsInr: 14500 },
  { month: "Jun", yourRate: 4.2, platformAvg: 12.0, returnsAvoided: 45, savingsInr: 24500, note: "⚡ Automated Overrides Activated" },
];

export default function ReturnReductionROIGraph() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5);
  const activeData = data[selectedMonthIndex];

  // Graph dimensions
  const width = 800;
  const height = 240;
  const maxRate = 22;

  const getX = (index: number) => (index / (data.length - 1)) * (width - 100) + 50;
  const getY = (val: number) => height - (val / maxRate) * (height - 40) - 20;

  // Smooth cubic bezier curve for minimalist line
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = i > 0 ? points[i - 1].x : points[0].x;
      const y0 = i > 0 ? points[i - 1].y : points[0].y;
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = points[i + 1].x;
      const y2 = points[i + 1].y;
      const x3 = i !== points.length - 2 ? points[i + 2].x : x2;
      const y3 = i !== points.length - 2 ? points[i + 2].y : y2;

      const cp1x = x1 + (x2 - x0) / 6;
      const cp1y = y1 + (y2 - y0) / 6;
      const cp2x = x2 - (x3 - x1) / 6;
      const cp2y = y2 - (y3 - y1) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }
    return path;
  };

  const yourPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.yourRate) }));
  const avgPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.platformAvg) }));

  const yourRatePath = createSmoothPath(yourPoints);
  const yourRateAreaPath = `${yourRatePath} L ${getX(data.length - 1)},${height} L ${getX(0)},${height} Z`;
  const platformAvgPath = createSmoothPath(avgPoints);

  const totalSavingsInr = data.reduce((acc, curr) => acc + curr.savingsInr, 0);
  const totalAvoided = data.reduce((acc, curr) => acc + curr.returnsAvoided, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xs font-sans space-y-6 transition-all">
      {/* Header & Human Language Summary Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-[#0F766E] dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 shadow-2xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Your Return Rate vs. Platform Average (Past 6 Months)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time reduction metrics tracked across circular storefront feeds and AI size matching.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold w-fit">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0F766E] shadow-2xs"></span>
            <span className="text-slate-800 dark:text-slate-200">Your Return Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span>
            <span className="text-slate-500 dark:text-slate-400">Platform Average (12%)</span>
          </div>
        </div>
      </div>

      {/* Human-Language Summary Callout Banner */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 sm:p-5 text-emerald-900 dark:text-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              AI Impact Verified
            </span>
            <p className="text-sm sm:text-base font-bold leading-snug">
              📉 Your return rate dropped by <strong className="font-black text-emerald-700 dark:text-emerald-300">24%</strong> this month thanks to sizing advice and automated grading.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white/60 dark:bg-slate-900/60 px-3.5 py-2 rounded-lg border border-emerald-200/60 shrink-0">
          <div>
            <span className="text-slate-500 font-medium block">Total Saved:</span>
            <span>₹{totalSavingsInr.toLocaleString("en-IN")}</span>
          </div>
          <div className="h-6 w-px bg-emerald-200 dark:bg-emerald-800"></div>
          <div>
            <span className="text-slate-500 font-medium block">Returns Avoided:</span>
            <span>+{totalAvoided} items</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible min-w-[600px]">
          <defs>
            <linearGradient id="yourRateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F766E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
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
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
                className="dark:stroke-slate-800"
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

          {/* Platform Avg Line (Dashed Slate) */}
          <path
            d={platformAvgPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />

          {/* Your Rate Line (Solid Teal #0F766E) */}
          <path
            d={yourRatePath}
            fill="none"
            stroke="#0F766E"
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
              <g key={i} className="cursor-pointer group" onClick={() => setSelectedMonthIndex(i)}>
                {/* Hover vertical line */}
                {isSelected && (
                  <line
                    x1={cx}
                    y1="0"
                    x2={cx}
                    y2={height}
                    stroke="#0F766E"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Platform Avg Point */}
                <circle
                  cx={cx}
                  cy={cyAvg}
                  r="3.5"
                  fill="#94a3b8"
                  className="transition-all duration-200 group-hover:r-5"
                />

                {/* Your Rate Point */}
                <circle
                  cx={cx}
                  cy={cyYour}
                  r={isSelected ? "7" : "5"}
                  fill="#0F766E"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover:r-7 shadow-md"
                />

                {/* Month Label */}
                <text
                  x={cx}
                  y={height + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={isSelected ? "800" : "bold"}
                  fill={isSelected ? "#0F766E" : "#64748b"}
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
                  fill={isSelected ? "#0F766E" : "#334155"}
                  className="dark:fill-slate-300"
                >
                  {d.yourRate}%
                </text>
              </g>
            );
          })}

          {/* Annotation Badge for Month 4 (Apr) AI Enablement */}
          <g transform={`translate(${getX(3) - 75}, ${getY(data[3].yourRate) - 45})`}>
            <rect width="150" height="24" rx="6" fill="#f0fdf4" stroke="#10b981" strokeWidth="1" />
            <text x="75" y="16" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill="#065f46">
              ✨ AI Size Advisor Enabled
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Month Detail Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span>
            Selected: <strong className="text-slate-900 dark:text-white font-bold">{activeData.month}</strong> — Return Rate at <strong className="text-[#0F766E] dark:text-teal-400 font-bold">{activeData.yourRate}%</strong> vs. Platform Avg of <strong className="text-slate-500 font-bold">{activeData.platformAvg}%</strong>.
            {activeData.note && <span className="ml-1.5 text-[#0F766E] dark:text-teal-400 font-bold">{activeData.note}</span>}
          </span>
        </div>
        <span className="font-bold text-slate-500">Click any graph point to view historical breakdowns.</span>
      </div>
    </div>
  );
}
