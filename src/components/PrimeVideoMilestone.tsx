"use client";

import React from "react";
import { Sparkles, Lock, CheckCircle2, Zap, Play, Award, ShieldCheck, RefreshCcw, Crown, HeartHandshake } from "lucide-react";

export default function PrimeVideoMilestone() {
  const currentCredits = 420;
  const targetCredits = 500;
  const creditsNeeded = targetCredits - currentCredits;
  const progressPercent = Math.min(Math.round((currentCredits / targetCredits) * 100), 100);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <Zap className="w-4 h-4 fill-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>The Sustainability Flywheel</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xs">
                Exclusive Reward
              </span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Transforming circular shopping choices into premium digital lifestyle rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): Flywheel Explanation & Branded Progress Bar */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Milestone Progression</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              Next Tier Reward: Amazon Prime Video
            </h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-medium">
              Our Sustainability Flywheel rewards you for reducing environmental impact. Every refurbished item purchased powers your progress toward premium entertainment access.
            </p>

            {/* Branded Progress Bar Section */}
            <div className="mt-6 bg-gray-50/80 rounded-xl p-5 border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Tree Tier Goal</span>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">Unlock Prime Video at 500 points</div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 tracking-tight">{currentCredits}</span>
                  <span className="text-xs font-bold text-gray-400 ml-1">/ {targetCredits} Credits</span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3.5 bg-gray-200/80 rounded-full p-0.5 relative overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-[#00A8E1] rounded-full relative transition-all duration-1000 ease-out shadow-sm flex items-center justify-end pr-1"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white shadow-xs animate-pulse"></div>
                </div>
              </div>

              {/* Milestone Labels */}
              <div className="flex justify-between items-center text-[11px] font-bold mt-2 text-gray-400">
                <span className="text-emerald-700 font-extrabold">🌱 Sapling ({currentCredits} pts)</span>
                <span>84% Completed</span>
                <span className="text-[#00A8E1] font-extrabold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-[#00A8E1]" />
                  <span>Prime Video (500 pts)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions / Flywheel Boosters */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-700 mb-2.5 flex items-center justify-between">
              <span>Fastest way to earn your remaining <strong className="text-emerald-600">{creditsNeeded} credits</strong>:</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Instant Boost</span>
            </div>
            <div className="grid grid-cols-1 sm:max-w-[250px] gap-2.5">
              <div
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/80 text-xs font-semibold text-emerald-900 shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <RefreshCcw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold">Buy Refurbished</div>
                  <div className="text-[10px] text-emerald-600 font-medium">+100 to +200 pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Highly Visible Premium Amazon Prime Video Reward Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#001E3D] via-[#004B87] to-[#00A8E1] rounded-2xl p-6 md:p-7 border border-[#00A8E1]/40 shadow-xl shadow-[#004B87]/20 text-white relative overflow-hidden flex flex-col justify-between group hover:shadow-2xl hover:shadow-[#00A8E1]/30 hover:-translate-y-0.5 transition-all duration-500">
          
          {/* Glowing Background Elements */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#00A8E1]/40 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Row: Tag & Value */}
          <div className="flex items-center justify-between relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A8E1]/30 border border-cyan-300/40 text-cyan-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Partner Reward</span>
            </span>
            <span className="text-xs font-extrabold text-cyan-100 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 backdrop-blur-xs">
              Worth ₹299 / mo
            </span>
          </div>

          {/* Center Brand & Feature Info */}
          <div className="my-6 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-cyan-400 text-[#001E3D] flex items-center justify-center font-black shadow-md">
                <Play className="w-4 h-4 fill-[#001E3D] ml-0.5" />
              </div>
              <span className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
                prime video
              </span>
              <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-300 text-amber-950 px-1.5 py-0.5 rounded tracking-wider uppercase shadow-2xs">
                VIP
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-extrabold text-cyan-50 tracking-tight leading-snug">
              Unlock 1 Month Amazon Prime Video
            </h3>
            
            <p className="text-xs text-blue-100/85 mt-2 leading-relaxed font-medium">
              Enjoy unlimited ad-free streaming of award-winning movies, Amazon Originals, and live sports as our thank you for driving circular commerce.
            </p>

            {/* Feature Checklist */}
            <div className="mt-4 space-y-2.5 text-xs font-semibold text-cyan-100/90 bg-black/15 p-3.5 rounded-xl border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Unlimited 4K Ultra HD & Ad-Free Streaming</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Watch Citadel, The Boys, Mirzapur & more</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Instant activation code sent via email & SMS</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: CTA Button */}
          <div className="pt-2 relative z-10">
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00A8E1] via-[#008AE6] to-[#00509E] text-white font-black text-xs md:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-black/30 border border-cyan-200/30 opacity-95 cursor-not-allowed group-hover:scale-[1.01] transition-all"
            >
              <Lock className="w-4 h-4 text-cyan-200" />
              <span>Almost There ({creditsNeeded} Credits to Go)</span>
            </button>
            <div className="text-center text-[11px] text-cyan-200/80 mt-2 font-semibold">
              Complete 1 more refurbished purchase to unlock instantly
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
