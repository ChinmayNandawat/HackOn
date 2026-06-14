"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PackageOpen, Cloud, Sparkles } from "lucide-react";
import SustainabilityTier from "@/components/SustainabilityTier";
import { getOrCreateSessionId } from "@/lib/session";
import { ImpactResponse } from "@/types/impact";

export default function PersonalImpactStats() {
  const [data, setData] = useState<ImpactResponse["personal"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPersonalImpact() {
      try {
        const sessionId = getOrCreateSessionId();
        const res = await fetch(`/api/impact?sessionId=${sessionId}`);
        if (!res.ok) throw new Error("Failed to fetch personal impact");
        const json: ImpactResponse = await res.json();
        setData(json.personal);
      } catch (err) {
        console.error("Personal impact fetch error:", err);
        // Minimal fallback
        setData({
          items_diverted: 0,
          personal_co2_saved: 0,
          total_credits: 0,
          tier: "Bronze",
          next_tier_credits: 100,
          tier_progress_percent: 0,
          actions_taken: 0
        });
      } finally {
        setLoading(false);
      }
    }
    fetchPersonalImpact();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-emerald-50 rounded-xl"></div>
          <div className="h-32 bg-emerald-50 rounded-xl"></div>
          <div className="h-32 bg-emerald-50 rounded-xl"></div>
        </div>
        <div className="h-48 bg-emerald-50 rounded-xl"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <PackageOpen className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/60 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="text-4xl font-black text-emerald-900">{data.items_diverted}</div>
              <div className="text-sm font-bold text-emerald-700/80 leading-tight">Products Diverted<br/>from Landfill</div>
            </div>
            <PackageOpen className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-6 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <Cloud className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/60 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="text-4xl font-black text-emerald-900">{(data.personal_co2_saved || 0).toFixed(1)}<span className="text-xl ml-1 text-emerald-800">kg</span></div>
              <div className="text-sm font-bold text-emerald-700/80 leading-tight">Total CO₂ Emissions<br/>Saved</div>
            </div>
            <Cloud className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          </div>
        </Card>

        <Card className="p-6 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/60 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <div className="text-4xl font-black text-emerald-900">{data.total_credits}</div>
              <div className="text-sm font-bold text-emerald-700/80 leading-tight">Green Credits<br/>Earned</div>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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
