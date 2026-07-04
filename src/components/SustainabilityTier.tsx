"use client";

import { Check, Lock, Tag, Zap, Crown, ChevronRight, Leaf, Shield, Award } from "lucide-react";

interface SustainabilityTierProps {
  credits?: number;
  tier?: "Seed" | "Sapling" | "Tree";
  nextTierCredits?: number | null;
  progressPercent?: number;
}

const TIERS = [
  {
    name: "Seed" as const,
    icon: Leaf,
    threshold: 0,
    benefits: [
      { icon: Tag, text: "Browse local refurbished deals" },
      { icon: Zap, text: "Earn green credits on actions" },
    ],
  },
  {
    name: "Sapling" as const,
    icon: Shield,
    threshold: 100,
    benefits: [
      { icon: Zap, text: "Early access to refurbished deals" },
      { icon: Tag, text: "5% bonus credits on every action" },
    ],
  },
  {
    name: "Tree" as const,
    icon: Crown,
    threshold: 500,
    benefits: [
      { icon: Crown, text: "First access to premium deals" },
      { icon: Zap, text: "15% bonus credits on every action" },
      { icon: Tag, text: "Exclusive Tree-only flash sales & Prime Video Reward" },
    ],
  },
];

export default function SustainabilityTier({ credits = 420, tier = "Sapling" }: SustainabilityTierProps = {}) {
  const currentTierIndex = TIERS.findIndex((t) => t.name === tier);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  const CurrentIcon = TIERS[currentTierIndex]?.icon || Leaf;

  const maxCredits = 500;
  const overallProgress = Math.min((credits / maxCredits) * 100, 100);

  const milestones = [
    { position: 0, label: "0", tier: "Seed", icon: Leaf },
    { position: (100 / maxCredits) * 100, label: "100", tier: "Sapling", icon: Shield },
    { position: 100, label: "500", tier: "Tree", icon: Crown },
  ];

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-2xs border border-gray-200/80 flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Growth Journey & Tier Benefits</h3>
          <p className="text-xs text-gray-500 mt-0.5">Advance your tier status to unlock premium partner perks</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          <CurrentIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">🌱 {tier} Status</span>
        </div>
      </div>

      {/* Progress bar with milestones */}
      <div className="relative pt-6 pb-2">
        {/* Milestone labels above bar */}
        <div className="absolute top-0 left-0 right-0 flex">
          {milestones.map((m, i) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.tier}
                className="flex flex-col items-center absolute -translate-x-1/2"
                style={{ left: `${m.position}%` }}
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-gray-600">
                  <IconComp className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="relative h-2.5 bg-gray-100 rounded-full overflow-visible mt-2">
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-emerald-600 transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
          {/* Milestone dots */}
          {milestones.map((m, i) => {
            const isReached = currentTierIndex >= i;
            return (
              <div
                key={m.tier}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  isReached
                    ? "bg-emerald-600 border-white shadow-2xs"
                    : "bg-white border-gray-300"
                }`}
                style={{ left: `${m.position}%` }}
              >
                {isReached && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </div>
            );
          })}
        </div>

        {/* Labels below bar */}
        <div className="relative mt-2.5">
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
                <span className="text-xs font-semibold">{TIERS[i].name}</span>
                <span className="text-[10px] font-medium opacity-75">{m.label} cr</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credits counter */}
      {nextTier && (
        <div className="text-center text-xs text-gray-500 font-medium">
          <span className="text-emerald-700 font-bold">{credits}</span> / {nextTier.threshold} credits
          <span className="mx-1.5 text-gray-300">•</span>
          <span className="text-gray-700 font-semibold">{nextTier.threshold - credits}</span> to {nextTier.name}
        </div>
      )}
      {!nextTier && (
        <div className="text-center text-xs text-emerald-700 font-semibold">
          You have reached the highest tier!
        </div>
      )}

      {/* Benefits: Current + Next tier side by side */}
      <div className={`grid gap-4 ${nextTier ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {/* Current tier benefits */}
        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-1.5 mb-3">
            <CurrentIcon className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Your benefits</span>
          </div>
          <div className="space-y-2.5">
            {TIERS[currentTierIndex]?.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                  <b.icon className="w-3 h-3 text-emerald-700" />
                </div>
                <span className="text-xs text-gray-700 font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next tier unlock */}
        {nextTier && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 border-dashed">
            <div className="flex items-center gap-1.5 mb-3">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Unlock at {nextTier.name}</span>
            </div>
            <div className="space-y-2.5">
              {nextTier.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0">
                    <b.icon className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <span>{nextTier.threshold - credits} more credits to unlock</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
