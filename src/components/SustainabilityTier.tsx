"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SustainabilityTierProps {
  credits: number;
  tier: "Bronze" | "Silver" | "Gold";
  nextTierCredits: number | null;
  progressPercent: number;
}

export default function SustainabilityTier({ credits, tier, nextTierCredits, progressPercent }: SustainabilityTierProps) {
  let nextTier = "Silver";
  if (tier === "Silver") nextTier = "Gold";
  else if (tier === "Gold") nextTier = "Maxed";

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-emerald-100 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-70" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-emerald-950 tracking-tight">Sustainability Tier</h3>
          <p className="text-sm text-emerald-700/80 mt-1 font-medium">Keep choosing green to unlock more rewards.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`px-3 py-1 transition-all ${tier === 'Bronze' ? 'bg-amber-100/50 text-amber-800 border-amber-300 font-bold scale-110 shadow-sm' : 'bg-gray-50/50 text-gray-400 border-gray-200 opacity-60'}`}>Bronze</Badge>
          <div className="w-4 h-px bg-gray-200" />
          <Badge variant="outline" className={`px-3 py-1 transition-all ${tier === 'Silver' ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold scale-110 shadow-sm' : 'bg-gray-50/50 text-gray-400 border-gray-200 opacity-60'}`}>Silver</Badge>
          <div className="w-4 h-px bg-gray-200" />
          <Badge variant="outline" className={`px-3 py-1 transition-all ${tier === 'Gold' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-400 font-bold scale-110 shadow-sm' : 'bg-gray-50/50 text-gray-400 border-gray-200 opacity-60'}`}>Gold</Badge>
        </div>
      </div>

      <div className="space-y-3 mt-2 relative z-10">
        <Progress value={progressPercent} className="h-3 bg-emerald-50 [&>div]:bg-emerald-500 rounded-full" />
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-emerald-800">
            {tier === 'Gold' ? "You've reached the highest tier! 🎉" : `${nextTierCredits} credits to ${nextTier}`}
          </span>
          <span className="text-emerald-600/80">{credits} / {nextTierCredits ? credits + nextTierCredits : '∞'}</span>
        </div>
      </div>
    </div>
  );
}
