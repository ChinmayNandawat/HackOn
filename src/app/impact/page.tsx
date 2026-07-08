"use client";

import { useState } from "react";
import PersonalImpactStats from "@/components/PersonalImpactStats";
import PrimeVideoMilestone from "@/components/PrimeVideoMilestone";
import ImpactLeaderboard from "@/components/ImpactLeaderboard";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import SustainabilityTier from "@/components/SustainabilityTier";
import {
  ShieldCheck,
  Globe,
  TrendingUp,
  Award,
  Zap,
  Users,
  BarChart3,
  Sparkles,
  User,
  LayoutGrid,
} from "lucide-react";

export default function ImpactPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "dashboard" | "rewards" | "leaderboard" | "tiers"
  >("all");

  const platformStats = {
    returns_processed: "12,400+",
    co2_saved: "2.1",
    money_recovered: "38",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-gray-50/40 pb-28 font-sans">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Top Clean Light-Emerald User & Green Credits Hero Card */}
        <div className="w-full bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 rounded-3xl p-6 sm:p-8 lg:p-10 border border-emerald-200/80 shadow-sm relative overflow-hidden">
          {/* Subtle Decorative Accent */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left side: Profile Avatar & Level Identity */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100/90 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs">
                <User className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs sm:text-sm font-bold text-emerald-700 tracking-wide uppercase">
                  Welcome back,
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                  Conscious Circular Buyer
                </h1>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Level: Sapling Hero</span>
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    80 credits to Planet Protector
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Clean Green Credits Score Card */}
            <div className="w-full lg:w-auto bg-white border border-emerald-200/80 rounded-2xl p-5 sm:px-7 sm:py-5 shadow-2xs min-w-[260px]">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 mb-1">
                Green Credits
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                420
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: "84%" }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-600 flex justify-between">
                  <span>84% to next level</span>
                  <span>500 Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Navigation Tab Switcher */}
        <div className="w-full bg-white rounded-2xl border border-emerald-200/80 shadow-2xs p-2 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/80 shadow-2xs"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All Impact</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/80 shadow-2xs"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dashboard & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("rewards")}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "rewards"
                ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/80 shadow-2xs"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Rewards & Flywheel</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/80 shadow-2xs"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab("tiers")}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "tiers"
                ? "bg-emerald-100/90 text-emerald-950 border border-emerald-300/80 shadow-2xs"
                : "text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60"
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sustainability Tiers</span>
          </button>
        </div>

        {/* Dynamic Content Views */}
        <div className="space-y-12">
          {/* Dashboard & Stats Section */}
          {(activeTab === "all" || activeTab === "dashboard") && (
            <div className="space-y-10">
              {/* SECTION 1: Hero Stats */}
              <section aria-label="Hero Impact Stats">
                <PersonalImpactStats />
              </section>

              {/* SECTION 4: Recent Activity Feed */}
              <section aria-label="Recent Sustainable Actions">
                <RecentActivityFeed />
              </section>

              {/* Supporting Section: Platform-wide stats */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">
                      Platform-Wide Circular Economy Impact
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                    Live Verified Network
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="text-center md:text-left p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                    <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      {platformStats.returns_processed}
                    </div>
                    <div className="text-xs text-emerald-600 font-extrabold mt-1 uppercase tracking-wider">
                      Refurbished Items Sold
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      High-quality renewed products purchased
                    </p>
                  </div>
                  <div className="text-center md:text-left p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                    <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      {platformStats.co2_saved}{" "}
                      <span className="text-lg md:text-xl text-gray-500 font-bold">
                        tonnes
                      </span>
                    </div>
                    <div className="text-xs text-teal-600 font-extrabold mt-1 uppercase tracking-wider">
                      Total CO₂ Saved
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      Verified environmental footprint reduction
                    </p>
                  </div>
                  <div className="text-center md:text-left p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                    <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      ₹{platformStats.money_recovered}{" "}
                      <span className="text-lg md:text-xl text-gray-500 font-bold">
                        lakhs
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 font-extrabold mt-1 uppercase tracking-wider">
                      Value Recovered
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      Savings passed directly to conscious shoppers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards & Flywheel Section */}
          {(activeTab === "all" || activeTab === "rewards") && (
            <div className="space-y-10">
              {/* SECTION 2: The Prime Video Milestone */}
              <section
                id="prime-video-reward"
                aria-label="Prime Video Milestone Reward"
              >
                <PrimeVideoMilestone />
              </section>

              {/* Supporting Section: How to Earn Green Credits */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                      Powering Your Sustainability Flywheel
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">
                    How to Earn
                  </span>
                </div>
                <div className="grid grid-cols-1 md:max-w-md gap-5">
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#008AE6] mb-4 group-hover:scale-110 group-hover:bg-[#008AE6] group-hover:text-white transition-all border border-blue-100 group-hover:border-[#008AE6] shadow-2xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-black text-[#008AE6] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 border border-blue-100">
                      +100 to +250 Credits
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-base">
                      Buy AI-Verified Refurbished
                    </h4>
                    <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                      Earn generous Green Credits every time you choose an
                      AI-inspected, grade A renewed product over a brand new one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Section */}
          {(activeTab === "all" || activeTab === "leaderboard") && (
            <section aria-label="Community Buyer Leaderboard">
              <ImpactLeaderboard />
            </section>
          )}

          {/* Sustainability Tiers Section */}
          {(activeTab === "all" || activeTab === "tiers") && (
            <section aria-label="Sustainability Tiers">
              <SustainabilityTier />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
