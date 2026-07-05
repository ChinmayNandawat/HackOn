"use client";

import PersonalImpactStats from "@/components/PersonalImpactStats";
import PrimeVideoMilestone from "@/components/PrimeVideoMilestone";
import ImpactLeaderboard from "@/components/ImpactLeaderboard";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import SustainabilityTier from "@/components/SustainabilityTier";
import { RefreshCcw, ShieldCheck, HeartHandshake, Globe, Leaf, TrendingUp } from "lucide-react";

export default function ImpactPage() {
  const platformStats = {
    returns_processed: "12,400+",
    co2_saved: "2.1",
    money_recovered: "38",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-gray-50/50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 font-sans space-y-12 pb-24">
        
        {/* Page Header */}
        <div className="space-y-2 text-center md:text-left pt-2">
          <div className="flex items-center gap-2.5 justify-center md:justify-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center shadow-2xs text-lg">
              🌱
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              My Green Impact
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 font-medium max-w-2xl">
            Track your verified carbon reduction, climb the community leaderboard, and unlock partner rewards through circular commerce.
          </p>
        </div>

        {/* SECTION 1: Hero Stats (The Hook) */}
        <section aria-label="Hero Impact Stats">
          <PersonalImpactStats />
        </section>

        {/* SECTION 2: The Prime Video Milestone (Crucial Marketing Feature) */}
        <section id="prime-video-reward" aria-label="Prime Video Milestone Reward">
          <PrimeVideoMilestone />
        </section>

        {/* SECTION 3: Interactive Leaderboard */}
        <section aria-label="Community Buyer Leaderboard">
          <ImpactLeaderboard />
        </section>

        {/* SECTION 4: Recent Activity Feed */}
        <section aria-label="Recent Sustainable Actions">
          <RecentActivityFeed />
        </section>

        {/* Supporting Section: Growth Journey & Tier Benefits */}
        <section aria-label="Sustainability Tiers">
          <SustainabilityTier />
        </section>

        {/* Supporting Section: Platform-wide stats — light compact banner */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Platform-Wide Circular Economy Impact</h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
              Live Verified Network
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center md:text-left p-4 rounded-xl bg-gray-50/60 border border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{platformStats.returns_processed}</div>
              <div className="text-xs text-emerald-600 font-extrabold mt-1 uppercase tracking-wider">Refurbished Items Sold</div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">High-quality renewed products purchased</p>
            </div>
            <div className="text-center md:text-left p-4 rounded-xl bg-gray-50/60 border border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{platformStats.co2_saved} <span className="text-lg md:text-xl text-gray-500 font-bold">tonnes</span></div>
              <div className="text-xs text-teal-600 font-extrabold mt-1 uppercase tracking-wider">Total CO₂ Saved</div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">Verified environmental footprint reduction</p>
            </div>
            <div className="text-center md:text-left p-4 rounded-xl bg-gray-50/60 border border-gray-100">
              <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">₹{platformStats.money_recovered} <span className="text-lg md:text-xl text-gray-500 font-bold">lakhs</span></div>
              <div className="text-xs text-blue-600 font-extrabold mt-1 uppercase tracking-wider">Value Recovered</div>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">Savings passed directly to conscious shoppers</p>
            </div>
          </div>
        </div>

        {/* Supporting Section: How to Earn Green Credits */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Powering Your Sustainability Flywheel</h3>
            </div>
            <span className="text-xs text-gray-500 font-semibold">How to Earn</span>
          </div>
          <div className="grid grid-cols-1 md:max-w-md gap-5">
            
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#008AE6] mb-4 group-hover:scale-110 group-hover:bg-[#008AE6] group-hover:text-white transition-all border border-blue-100 group-hover:border-[#008AE6] shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black text-[#008AE6] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 border border-blue-100">
                +100 to +250 Credits
              </div>
              <h4 className="font-extrabold text-gray-900 text-base">Buy AI-Verified Refurbished</h4>
              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                Earn generous Green Credits every time you choose an AI-inspected, grade A renewed product over a brand new one.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
