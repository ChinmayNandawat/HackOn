"use client";

import { Card } from "@/components/ui/card";
import { PackageOpen, Cloud, Sparkles } from "lucide-react";
import SustainabilityTier from "@/components/SustainabilityTier";

export default function PersonalImpactStats() {
  // Hardcoded demo data — impressive but realistic
  const data = {
    items_diverted: 234,
    personal_co2_saved: 847,
    total_credits: 340,
    tier: "Sapling" as const,
    next_tier_credits: 500,
    tier_progress_percent: 68,
    actions_taken: 42,
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-gray-100 bg-white shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <PackageOpen className="absolute -right-3 -bottom-3 w-20 h-20 text-emerald-50 group-hover:text-emerald-100/80 transition-colors duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900">{data.items_diverted}</div>
              <div className="text-xs font-semibold text-gray-500 leading-tight">Products Diverted<br/>from Landfill</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <PackageOpen className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-gray-100 bg-white shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <Cloud className="absolute -right-3 -bottom-3 w-20 h-20 text-emerald-50 group-hover:text-emerald-100/80 transition-colors duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900">{data.personal_co2_saved}<span className="text-lg ml-1 text-gray-400 font-bold">kg</span></div>
              <div className="text-xs font-semibold text-gray-500 leading-tight">Total CO₂ Emissions<br/>Saved</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Cloud className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-gray-100 bg-white shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <Sparkles className="absolute -right-3 -bottom-3 w-20 h-20 text-emerald-50 group-hover:text-emerald-100/80 transition-colors duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="text-3xl font-black text-gray-900">{data.total_credits}</div>
              <div className="text-xs font-semibold text-gray-500 leading-tight">Green Credits<br/>Earned</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      <SustainabilityTier 
        credits={data.total_credits} 
        tier={data.tier}
        nextTierCredits={data.next_tier_credits}
        progressPercent={data.tier_progress_percent}
      />
    </>
  );
}
