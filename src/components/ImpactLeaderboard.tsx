"use client";

import React, { useState } from "react";
import { Trophy, Sparkles, Building2, ArrowRight, Leaf } from "lucide-react";

type ScopeTab = "local" | "national" | "global";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
  location: string;
  tier: "Tree" | "Sapling" | "Seed";
  circularActivity: string;
  credits: number;
  isCurrentUser?: boolean;
}

const localUsers: LeaderboardUser[] = [
  { id: "loc-1", rank: 1, name: "EcoWarrior", initials: "EW", avatarColor: "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300 shadow-md", location: "Hyderabad", tier: "Tree", circularActivity: "14 Refurbished Gadgets Saved", credits: 1200 },
  { id: "loc-2", rank: 2, name: "You (Conscious Shopper)", initials: "YOU", avatarColor: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/50", location: "Hyderabad", tier: "Sapling", circularActivity: "3 Refurbished Items Bought", credits: 420, isCurrentUser: true },
  { id: "loc-3", rank: 3, name: "GreenGuardian", initials: "GG", avatarColor: "bg-teal-100 text-teal-800 border-teal-300", location: "Hyderabad", tier: "Sapling", circularActivity: "8 kg CO₂ Emissions Prevented", credits: 390 },
  { id: "loc-4", rank: 4, name: "CircularSam", initials: "CS", avatarColor: "bg-blue-100 text-blue-800 border-blue-300", location: "Hyderabad", tier: "Sapling", circularActivity: "5 Renewed Apparel Saves", credits: 310 },
  { id: "loc-5", rank: 5, name: "Aarav Tech", initials: "AT", avatarColor: "bg-purple-100 text-purple-800 border-purple-300", location: "Hyderabad", tier: "Sapling", circularActivity: "4 Open-Box Orders Kept", credits: 280 },
  { id: "loc-6", rank: 6, name: "Maya Refurb", initials: "MR", avatarColor: "bg-indigo-100 text-indigo-800 border-indigo-300", location: "Hyderabad", tier: "Sapling", circularActivity: "3 Electronics Diverted", credits: 240 },
  { id: "loc-7", rank: 7, name: "Rohit ZeroWaste", initials: "RZ", avatarColor: "bg-rose-100 text-rose-800 border-rose-300", location: "Hyderabad", tier: "Seed", circularActivity: "2 Items Donated to Charity", credits: 190 },
  { id: "loc-8", rank: 8, name: "Priya Circular", initials: "PC", avatarColor: "bg-amber-100 text-amber-800 border-amber-300", location: "Hyderabad", tier: "Seed", circularActivity: "1 Refurbished Home Appliance", credits: 150 },
];

const nationalUsers: LeaderboardUser[] = [
  { id: "nat-1", rank: 1, name: "EcoWarrior", initials: "EW", avatarColor: "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300", location: "Hyderabad", tier: "Tree", circularActivity: "32 Refurbished Tech Items Saved", credits: 1200 },
  { id: "nat-2", rank: 2, name: "Aarav S.", initials: "AS", avatarColor: "bg-amber-100 text-amber-800 border-amber-300", location: "Bengaluru", tier: "Tree", circularActivity: "280 kg E-Waste Prevented", credits: 940 },
  { id: "nat-3", rank: 3, name: "Rhea M.", initials: "RM", avatarColor: "bg-emerald-100 text-emerald-800 border-emerald-300", location: "Mumbai", tier: "Tree", circularActivity: "24 Renewed Gadgets Orders", credits: 820 },
  { id: "nat-4", rank: 4, name: "Kabir N.", initials: "KN", avatarColor: "bg-teal-100 text-teal-800 border-teal-300", location: "New Delhi", tier: "Tree", circularActivity: "18 Renewed Tech Items Saved", credits: 750 },
  { id: "nat-5", rank: 5, name: "Ananya V.", initials: "AV", avatarColor: "bg-indigo-100 text-indigo-800 border-indigo-300", location: "Pune", tier: "Tree", circularActivity: "150 kg E-Waste Prevented", credits: 610 },
  { id: "nat-6", rank: 14, name: "You (Conscious Shopper)", initials: "YOU", avatarColor: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md", location: "Hyderabad", tier: "Sapling", circularActivity: "3 Refurbished Items Bought", credits: 420, isCurrentUser: true },
];

const globalUsers: LeaderboardUser[] = [
  { id: "glob-1", rank: 1, name: "Elena R.", initials: "ER", avatarColor: "bg-emerald-100 text-emerald-800 border-emerald-300", location: "Berlin, DE", tier: "Tree", circularActivity: "54 Refurbished Items Diverted", credits: 2450 },
  { id: "glob-2", rank: 2, name: "Marcus T.", initials: "MT", avatarColor: "bg-blue-100 text-blue-800 border-blue-300", location: "London, UK", tier: "Tree", circularActivity: "480 kg E-Waste Prevented", credits: 1980 },
  { id: "glob-3", rank: 3, name: "EcoWarrior", initials: "EW", avatarColor: "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300", location: "Hyderabad, IN", tier: "Tree", circularActivity: "14 Refurbished Gadgets Saved", credits: 1200 },
  { id: "glob-4", rank: 4, name: "Kenji S.", initials: "KS", avatarColor: "bg-amber-100 text-amber-800 border-amber-300", location: "Tokyo, JP", tier: "Tree", circularActivity: "388 kg CO₂ Emissions Avoided", credits: 1040 },
  { id: "glob-5", rank: 88, name: "You (Conscious Shopper)", initials: "YOU", avatarColor: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md", location: "Hyderabad, IN", tier: "Sapling", circularActivity: "3 Refurbished Items Bought", credits: 420, isCurrentUser: true },
];

export default function ImpactLeaderboard() {
  const [activeTab, setActiveTab] = useState<ScopeTab>("local");

  const currentList = activeTab === "local" ? localUsers : activeTab === "national" ? nationalUsers : globalUsers;

  const bannerInfo = {
    local: {
      title: "Your Rank: #2 in Local (Hyderabad)",
      description: "Incredible! You are only 780 credits behind #1 EcoWarrior. One more refurbished purchase could put you in first place!",
      credits: 420,
    },
    national: {
      title: "Your Rank: #14 Nationwide",
      description: "You are in the top 1% circular shoppers across India! Keep buying refurbished items to enter the Top 10.",
      credits: 420,
    },
    global: {
      title: "Your Rank: #88 Globally",
      description: "Join 15,000+ circular champions worldwide. Your 18 kg CO₂ saved puts you in the Global Elite circle!",
      credits: 420,
    },
  }[activeTab];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Interactive Buyer Leaderboard</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Gamified Impact
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            See how your circular shopping stacks up against top eco-conscious buyers in your community.
          </p>
        </div>

        {/* Interactive Scope Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start md:self-center border border-gray-200/80 text-xs font-bold" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "local"}
            onClick={() => setActiveTab("local")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "local"
                ? "bg-white text-emerald-900 shadow-sm border border-gray-200 font-extrabold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>Local (Hyderabad)</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "national"}
            onClick={() => setActiveTab("national")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "national"
                ? "bg-white text-emerald-900 shadow-sm border border-gray-200 font-extrabold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>National</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "global"}
            onClick={() => setActiveTab("global")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "global"
                ? "bg-white text-emerald-900 shadow-sm border border-gray-200 font-extrabold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>Global Champions</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Ranking Table */}
      <div className="space-y-3">
        {currentList.map((user) => {
          const isTop3 = user.rank <= 3;

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                user.isCurrentUser
                  ? "bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border-emerald-300 shadow-md ring-1 ring-emerald-500/30 scale-[1.01]"
                  : isTop3
                  ? "bg-gradient-to-r from-amber-50/20 via-white to-white border-amber-200/60 hover:shadow-md hover:-translate-y-0.5"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-3.5 md:gap-4">
                {/* Rank Medal/Number */}
                <div className="w-8 flex items-center justify-center">
                  <span className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center border shadow-2xs ${
                    user.rank === 1 ? "bg-amber-100 text-amber-900 border-amber-300" :
                    user.rank === 2 ? "bg-gray-100 text-gray-800 border-gray-300" :
                    user.rank === 3 ? "bg-orange-100 text-orange-900 border-orange-300" :
                    "bg-gray-100 text-gray-600 border-gray-200/80"
                  }`}>
                    #{user.rank}
                  </span>
                </div>

                {/* Avatar / Initials */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs md:text-sm shrink-0 border shadow-2xs ${user.avatarColor}`}
                >
                  {user.initials}
                </div>

                {/* Buyer Identity & Circular Activity */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${user.isCurrentUser ? "text-emerald-950 font-black text-base" : "text-gray-900"}`}>
                      {user.name}
                    </span>
                    
                    {user.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs animate-pulse">
                        You
                      </span>
                    )}

                    {/* Minimalist Green Leaf Badge next to Top Players */}
                    {isTop3 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs" title="Top Circular Champion">
                        <Leaf className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{user.rank === 1 ? "Top Champion" : user.rank === 2 ? "Circular Hero" : "Eco Pioneer"}</span>
                      </span>
                    )}

                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      {user.location} • {user.tier} Tier
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${user.isCurrentUser ? "bg-emerald-600 animate-ping" : "bg-emerald-500"}`}></span>
                    <span className={user.isCurrentUser ? "font-bold text-emerald-900" : ""}>{user.circularActivity}</span>
                  </p>
                </div>
              </div>

              {/* Green Credit Score Pill */}
              <div className="text-right shrink-0">
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs md:text-sm shadow-2xs transition-all ${
                  user.isCurrentUser 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-105" 
                    : isTop3
                    ? "bg-amber-50 text-amber-900 border border-amber-300/80"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}>
                  <Leaf className={`w-3.5 h-3.5 ${user.isCurrentUser ? "text-white fill-white" : "text-emerald-500 fill-emerald-500"}`} />
                  <span>{user.credits.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky User's Personal Rank Banner (Gamification Hook) */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden group">
          {/* Subtle Highlight Glow */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-teal-400/10 rounded-full blur-lg pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="text-xs md:text-sm font-bold text-emerald-100">
                <span className="text-white font-black">{bannerInfo.title}</span> •{" "}
                <span className="text-emerald-300 font-extrabold">{bannerInfo.credits} Credits</span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5 leading-normal">
                {bannerInfo.description}
              </p>
            </div>
          </div>

          <div className="self-end sm:self-center shrink-0 relative z-10">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 hover:from-emerald-300 hover:to-teal-300 font-black text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <span>Climb to #1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
