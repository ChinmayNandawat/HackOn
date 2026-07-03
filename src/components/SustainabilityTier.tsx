"use client";

import { Check, Lock, Tag, Zap, Crown, ChevronRight } from "lucide-react";

interface SustainabilityTierProps {
  credits: number;
  tier: "Seed" | "Sapling" | "Tree";
  nextTierCredits: number | null;
  progressPercent: number;
}

const TIERS = [
  {
    name: "Seed" as const,
    icon: "🌱",
    threshold: 0,
    benefits: [
      { icon: Tag, text: "Browse local refurbished deals" },
      { icon: Zap, text: "Earn green credits on actions" },
    ],
  },
  {
    name: "Sapling" as const,
    icon: "🌿",
    threshold: 100,
    benefits: [
      { icon: Zap, text: "Early access to refurbished deals" },
      { icon: Tag, text: "5% bonus credits on every action" },
    ],
  },
  {
    name: "Tree" as const,
    icon: "🌳",
    threshold: 500,
    benefits: [
      { icon: Crown, text: "First access to premium deals" },
      { icon: Zap, text: "15% bonus credits on every action" },
      { icon: Tag, text: "Exclusive Tree-only flash sales" },
    ],
  },
];

export default function SustainabilityTier({ credits, tier }: SustainabilityTierProps) {
  const currentTierIndex = TIERS.findIndex((t) => t.name === tier);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;

  // Calculate overall progress across all tiers (0-100 for full bar)
  const maxCredits = 500;
  const overallProgress = Math.min((credits / maxCredits) * 100, 100);

  // Milestone positions as percentages
  const milestones = [
    { position: 0, label: "0", tier: "Seed" },
    { position: (100 / maxCredits) * 100, label: "100", tier: "Sapling" },
    { position: 100, label: "500", tier: "Tree" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100 flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Your Growth Journey</h3>
          <p className="text-xs text-gray-500 mt-0.5">Grow your tier to unlock better deals in your area</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="text-lg">{TIERS[currentTierIndex]?.icon}</span>
          <span className="text-sm font-bold text-emerald-700">{tier}</span>
        </div>
      </div>

      {/* Progress bar with milestones */}
      <div className="relative pt-6 pb-2">
        {/* Milestone labels above bar */}
        <div className="absolute top-0 left-0 right-0 flex">
          {milestones.map((m, i) => {
            const tierData = TIERS[i];
            const isReached = currentTierIndex >= i;
            return (
              <div
                key={m.tier}
                className="flex flex-col items-center absolute -translate-x-1/2"
                style={{ left: `${m.position}%` }}
              >
                <span className="text-lg mb-0.5">{tierData.icon}</span>
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-visible mt-1">
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500 transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
          {/* Milestone dots */}
          {milestones.map((m, i) => {
            const isReached = currentTierIndex >= i;
            return (
              <div
                key={m.tier}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-[2.5px] transition-all duration-300 flex items-center justify-center ${
                  isReached
                    ? "bg-emerald-500 border-white shadow-md"
                    : "bg-white border-gray-200"
                }`}
                style={{ left: `${m.position}%` }}
              >
                {isReached && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            );
          })}
        </div>

        {/* Labels below bar */}
        <div className="relative mt-2">
          {milestones.map((m, i) => {
            const isReached = currentTierIndex >= i;
            return (
              <div
                key={m.tier}
                className={`absolute -translate-x-1/2 flex flex-col items-center ${
                  isReached ? "text-emerald-700" : "text-gray-400"
                }`}
                style={{ left: `${m.position}%` }}
              >
                <span className="text-[11px] font-bold">{TIERS[i].name}</span>
                <span className="text-[10px] font-medium opacity-70">{m.label} cr</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credits counter */}
      {nextTier && (
        <div className="text-center text-xs text-gray-500 font-medium -mt-1">
          <span className="text-emerald-600 font-bold">{credits}</span> / {nextTier.threshold} credits
          <span className="mx-1">·</span>
          <span className="text-emerald-600 font-semibold">{nextTier.threshold - credits}</span> to {nextTier.name}
        </div>
      )}
      {!nextTier && (
        <div className="text-center text-xs text-emerald-600 font-semibold -mt-1">
          You've reached the highest tier!
        </div>
      )}

      {/* Benefits: Current + Next tier side by side */}
      <div className={`grid gap-3 ${nextTier ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {/* Current tier benefits */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100/80">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm">{TIERS[currentTierIndex]?.icon}</span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Your benefits</span>
          </div>
          <div className="space-y-2">
            {TIERS[currentTierIndex]?.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-xs text-gray-700 font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next tier unlock */}
        {nextTier && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 border-dashed relative">
            <div className="flex items-center gap-1.5 mb-3">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unlock at {nextTier.name}</span>
            </div>
            <div className="space-y-2">
              {nextTier.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span>{nextTier.threshold - credits} more credits to unlock</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
