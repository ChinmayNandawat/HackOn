"use client";

import { Card } from "@/components/ui/card";
import { PackageOpen, Cloud, Sparkles, Award, Leaf } from "lucide-react";

export default function PersonalImpactStats() {
  const data = {
    total_credits: 420,
    personal_co2_saved: 18,
    items_diverted: 3,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Your Circular Impact Summary</span>
        </span>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
          <span>🌱</span>
          <span>Sapling Tier • Verified Impact</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Green Credits Earned */}
        <Card className="p-6 border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100 group-hover:text-emerald-200/80 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 tracking-tight">{data.total_credits}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">+15% this month</span>
              </div>
              <div className="text-sm font-extrabold text-gray-800 leading-tight">Green Credits Earned</div>
              <p className="text-xs text-gray-500 font-medium">Earned by choosing refurbished over new</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
          </div>
        </Card>

        {/* Card 2: CO2 Saved */}
        <Card className="p-6 border-teal-200/80 bg-gradient-to-br from-teal-500/10 via-teal-50/50 to-white shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <Cloud className="absolute -right-4 -bottom-4 w-24 h-24 text-teal-100 group-hover:text-teal-200/80 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 tracking-tight">{data.personal_co2_saved}</span>
                <span className="text-lg font-bold text-gray-500">kg</span>
                <span className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full ml-0.5">≈ 80 km driven</span>
              </div>
              <div className="text-sm font-extrabold text-gray-800 leading-tight">CO₂ Emissions Saved</div>
              <p className="text-xs text-gray-500 font-medium">Prevented manufacturing & return logistics emissions</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
              <Cloud className="w-5 h-5 fill-white" />
            </div>
          </div>
        </Card>

        {/* Card 3: Items Kept from Landfills */}
        <Card className="p-6 border-cyan-200/80 bg-gradient-to-br from-cyan-500/10 via-cyan-50/50 to-white shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <PackageOpen className="absolute -right-4 -bottom-4 w-24 h-24 text-cyan-100 group-hover:text-cyan-200/80 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 tracking-tight">{data.items_diverted}</span>
                <span className="text-xs font-bold text-cyan-700 bg-cyan-100/80 px-2 py-0.5 rounded-full">Smart circular choice</span>
              </div>
              <div className="text-sm font-extrabold text-gray-800 leading-tight">Refurbished Items Bought</div>
              <p className="text-xs text-gray-500 font-medium">Chosen instead of buying brand new products</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
              <PackageOpen className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
