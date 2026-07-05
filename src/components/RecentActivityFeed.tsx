"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, HeartHandshake, Leaf, Cloud, History, ArrowUpRight } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  credits: number;
  co2Saved: number;
  timestamp: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  category: string;
}

const recentActivities: ActivityItem[] = [
  {
    id: "act-1",
    action: "Purchased Grade A Refurbished Sony WH-1000XM4",
    description: "Verified AI-inspected premium audio gear • Saved from e-waste stream",
    credits: 50,
    co2Saved: 2,
    timestamp: "Today, 2:15 PM",
    icon: Sparkles,
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    category: "Refurbished Buy",
  },
  {
    id: "act-2",
    action: "Purchased Refurbished Samsung Galaxy S23",
    description: "Verified AI-inspected smartphone • Saved from e-waste stream",
    credits: 120,
    co2Saved: 5,
    timestamp: "Yesterday",
    icon: ShieldCheck,
    iconBg: "bg-blue-50 border-blue-200",
    iconColor: "text-[#008AE6]",
    category: "Refurbished Buy",
  },
  {
    id: "act-3",
    action: "Purchased Renewed Apple MacBook Air M2 (16GB/512GB)",
    description: "Grade A Refurbished Laptop • 100% battery health verified by AI technician",
    credits: 150,
    co2Saved: 7,
    timestamp: "3 days ago",
    icon: Zap,
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    category: "Refurbished Buy",
  },
  {
    id: "act-4",
    action: "Purchased Renewed Dell UltraSharp 27 Monitor",
    description: "Grade A Refurbished Display • Certified perfect working condition",
    credits: 100,
    co2Saved: 4,
    timestamp: "Jul 1, 2026",
    icon: HeartHandshake,
    iconBg: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    category: "Refurbished Buy",
  },
];

export default function RecentActivityFeed() {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <span>Recent Sustainable Actions</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live Feed</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time log of your circular shopping decisions, Green Credit earnings, and CO₂ reductions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center text-xs font-bold text-gray-500 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100">
          <span>Total Logged:</span>
          <span className="text-emerald-600 font-extrabold">+420 pts</span>
          <span>•</span>
          <span className="text-teal-600 font-extrabold">18 kg CO₂</span>
        </div>
      </div>

      {/* Minimalistic Activity List */}
      <div className="space-y-3.5">
        {recentActivities.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 hover:border-gray-200 transition-all duration-200 group gap-3.5"
          >
            {/* Left: Icon & Description */}
            <div className="flex items-start md:items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform ${item.iconBg} ${item.iconColor}`}
              >
                <item.icon className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900 group-hover:text-emerald-950 transition-colors">
                    {item.action}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200/80">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Right: Impact Badges & Timestamp */}
            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 shrink-0 pl-13 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
              <div className="flex items-center gap-2">
                {/* Green Credits Pill */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs shadow-2xs">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  <span>+{item.credits} Green Credits</span>
                </div>

                {/* CO2 Saved Pill */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-extrabold text-xs shadow-2xs">
                  <Cloud className="w-3 h-3 text-teal-600" />
                  <span>+{item.co2Saved}kg CO₂ saved</span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-[11px] font-semibold text-gray-400 min-w-[80px] text-right">
                {item.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary CTA */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
        <span>Showing 4 of 4 circular activities from your current billing cycle.</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700 transition-colors group cursor-pointer"
        >
          <span>View All Order History & Emissions Log</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
