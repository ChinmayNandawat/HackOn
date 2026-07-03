"use client";

import React, { useState } from "react";
import { Trophy, Sparkles, Globe, MapPin, Building2, ArrowRight, Award, Leaf } from "lucide-react";

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
  { id: "loc-1", rank: 1, name: "Ananya V.", initials: "AV", avatarColor: "bg-emerald-100 text-emerald-800 border-emerald-300", location: "Hyderabad", tier: "Tree", circularActivity: "18 Renewed Tech Items Saved", credits: 4850 },
  { id: "loc-2", rank: 2, name: "Karthik R.", initials: "KR", avatarColor: "bg-teal-100 text-teal-800 border-teal-300", location: "Hyderabad", tier: "Tree", circularActivity: "14 Refurbished Gadgets Saved", credits: 4120 },
  { id: "loc-3", rank: 3, name: "Priya M.", initials: "PM", avatarColor: "bg-blue-100 text-blue-800 border-blue-300", location: "Hyderabad", tier: "Tree", circularActivity: "110 kg E-Waste Prevented", credits: 3890 },
  { id: "loc-4", rank: 4, name: "Rahul S.", initials: "RS", avatarColor: "bg-purple-100 text-purple-800 border-purple-300", location: "Hyderabad", tier: "Sapling", circularActivity: "12 Sustainable Apparel Returns Diverted", credits: 2740 },
  { id: "loc-5", rank: 5, name: "Sneha K.", initials: "SK", avatarColor: "bg-amber-100 text-amber-800 border-amber-300", location: "Hyderabad", tier: "Sapling", circularActivity: "9 Renewed Electronics Orders", credits: 2150 },
  { id: "loc-6", rank: 6, name: "Vikram D.", initials: "VD", avatarColor: "bg-indigo-100 text-indigo-800 border-indigo-300", location: "Hyderabad", tier: "Sapling", circularActivity: "65 kg CO₂ Emissions Avoided", credits: 1820 },
  { id: "loc-7", rank: 7, name: "Divya P.", initials: "DP", avatarColor: "bg-rose-100 text-rose-800 border-rose-300", location: "Hyderabad", tier: "Sapling", circularActivity: "6 Refurbished Home Items", credits: 1500 },
  { id: "loc-8", rank: 8, name: "You (Conscious Shopper)", initials: "CS", avatarColor: "bg-emerald-600 text-white border-emerald-500 shadow-sm", location: "Hyderabad", tier: "Sapling", circularActivity: "5 Products Diverted from Landfill", credits: 1240, isCurrentUser: true },
];

const nationalUsers: LeaderboardUser[] = [
  { id: "nat-1", rank: 1, name: "Aarav S.", initials: "AS", avatarColor: "bg-amber-100 text-amber-800 border-amber-300", location: "Bengaluru", tier: "Tree", circularActivity: "32 Refurbished Tech Items Saved", credits: 8940 },
  { id: "nat-2", rank: 2, name: "Rhea M.", initials: "RM", avatarColor: "bg-emerald-100 text-emerald-800 border-emerald-300", location: "Mumbai", tier: "Tree", circularActivity: "280 kg E-Waste Prevented", credits: 7650 },
  { id: "nat-3", rank: 3, name: "Kabir N.", initials: "KN", avatarColor: "bg-teal-100 text-teal-800 border-teal-300", location: "New Delhi", tier: "Tree", circularActivity: "24 Renewed Gadgets Orders", credits: 6820 },
  { id: "nat-4", rank: 4, name: "Ananya V.", initials: "AV", avatarColor: "bg-indigo-100 text-indigo-800 border-indigo-300", location: "Hyderabad", tier: "Tree", circularActivity: "18 Renewed Tech Items Saved", credits: 4850 },
  { id: "nat-5", rank: 5, name: "Aditya B.", initials: "AB", avatarColor: "bg-blue-100 text-blue-800 border-blue-300", location: "Pune", tier: "Tree", circularActivity: "150 kg E-Waste Prevented", credits: 4410 },
  { id: "nat-6", rank: 6, name: "Meera K.", initials: "MK", avatarColor: "bg-purple-100 text-purple-800 border-purple-300", location: "Chennai", tier: "Tree", circularActivity: "16 Sustainable Circular Orders", credits: 4200 },
  { id: "nat-7", rank: 7, name: "Karthik R.", initials: "KR", avatarColor: "bg-teal-100 text-teal-800 border-teal-300", location: "Hyderabad", tier: "Tree", circularActivity: "14 Refurbished Gadgets Saved", credits: 4120 },
];

const globalUsers: LeaderboardUser[] = [
  { id: "glob-1", rank: 1, name: "Elena R.", initials: "ER", avatarColor: "bg-emerald-100 text-emerald-800 border-emerald-300", location: "Berlin, DE", tier: "Tree", circularActivity: "54 Refurbished Items Diverted", credits: 14250 },
  { id: "glob-2", rank: 2, name: "Marcus T.", initials: "MT", avatarColor: "bg-blue-100 text-blue-800 border-blue-300", location: "London, UK", tier: "Tree", circularActivity: "480 kg E-Waste Prevented", credits: 12800 },
  { id: "glob-3", rank: 3, name: "Sophie L.", initials: "SL", avatarColor: "bg-purple-100 text-purple-800 border-purple-300", location: "Paris, FR", tier: "Tree", circularActivity: "42 Circular Fashion & Tech Saves", credits: 11500 },
  { id: "glob-4", rank: 4, name: "Kenji S.", initials: "KS", avatarColor: "bg-amber-100 text-amber-800 border-amber-300", location: "Tokyo, JP", tier: "Tree", circularActivity: "388 kg CO₂ Emissions Avoided", credits: 10400 },
  { id: "glob-5", rank: 5, name: "Aarav S.", initials: "AS", avatarColor: "bg-teal-100 text-teal-800 border-teal-300", location: "Bengaluru, IN", tier: "Tree", circularActivity: "32 Refurbished Tech Items Saved", credits: 8940 },
  { id: "glob-6", rank: 6, name: "Chloe M.", initials: "CM", avatarColor: "bg-rose-100 text-rose-800 border-rose-300", location: "Seattle, US", tier: "Tree", circularActivity: "29 Renewed Tech & Appliance Orders", credits: 8120 },
  { id: "glob-7", rank: 7, name: "Rhea M.", initials: "RM", avatarColor: "bg-indigo-100 text-indigo-800 border-indigo-300", location: "Mumbai, IN", tier: "Tree", circularActivity: "280 kg E-Waste Prevented", credits: 7650 },
];

export default function ImpactLeaderboard() {
  const [activeTab, setActiveTab] = useState<ScopeTab>("local");

  const currentList = activeTab === "local" ? localUsers : activeTab === "national" ? nationalUsers : globalUsers;

  const bannerInfo = {
    local: {
      title: "Your Rank: #8 in Local (Hyderabad)",
      description: "You only need 260 more credits (1 refurbished purchase) to enter the Top 5!",
    },
    national: {
      title: "Your Rank: #42 in National",
      description: "You are in the top 5% nationwide! Earn 380 more credits to reach Top 25 circular buyers.",
    },
    global: {
      title: "Your Rank: #184 Globally",
      description: "Join 15,000+ circular champions worldwide. Keep diverting returns from landfill to climb!",
    },
  }[activeTab];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Green Credit & Circular Impact Leaderboard</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Social Proof
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            See top conscious shoppers turning returns and renewals into real-world environmental impact.
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
            <span>📍</span>
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
            <span>🌍</span>
            <span>Global Champions</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Ranking Table */}
      <div className="space-y-3">
        {currentList.map((user) => {
          const isTop3 = user.rank <= 3;
          const medalIcon = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : null;

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                user.isCurrentUser
                  ? "bg-emerald-50/80 border-emerald-300 shadow-sm ring-1 ring-emerald-500/20"
                  : isTop3
                  ? "bg-gradient-to-r from-amber-50/20 via-white to-white border-amber-200/60 hover:shadow-md hover:-translate-y-0.5"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-3.5 md:gap-4">
                {/* Rank Medal/Number */}
                <div className="w-8 flex items-center justify-center">
                  {medalIcon ? (
                    <span className="text-xl transform hover:scale-125 transition-transform inline-block" title={`Rank #${user.rank}`}>
                      {medalIcon}
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-extrabold text-xs flex items-center justify-center border border-gray-200/80">
                      #{user.rank}
                    </span>
                  )}
                </div>

                {/* Avatar / Initials */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border shadow-2xs ${user.avatarColor}`}
                >
                  {user.initials}
                </div>

                {/* Buyer Identity & Circular Activity */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${user.isCurrentUser ? "text-emerald-950 font-black" : "text-gray-900"}`}>
                      {user.name}
                    </span>
                    {user.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                        You
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      {user.location} • {user.tier} Tier
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{user.circularActivity}</span>
                  </p>
                </div>
              </div>

              {/* Green Credit Score Pill */}
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs md:text-sm shadow-2xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{user.credits.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky User's Personal Rank Banner (Gamification Hook) */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-4.5 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-lg border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden group">
          {/* Subtle Highlight Glow */}
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-teal-400/10 rounded-full blur-lg pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs md:text-sm font-bold text-emerald-100">
                <span className="text-white font-black">{bannerInfo.title}</span> •{" "}
                <span className="text-emerald-300 font-extrabold">1,240 Credits</span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5 leading-normal">
                {bannerInfo.description}
              </p>
            </div>
          </div>

          <div className="self-end sm:self-center shrink-0 relative z-10">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-extrabold text-xs transition-all shadow-sm hover:shadow-md hover:scale-105"
            >
              <span>Earn Credits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
