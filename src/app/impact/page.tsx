import { ImpactApiResponse } from "@/types/impact";
import PersonalImpactStats from "@/components/PersonalImpactStats";
import { RefreshCcw, ShieldCheck, HeartHandshake } from "lucide-react";

export default async function ImpactPage() {
  let impactData: ImpactApiResponse;

  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/impact`);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    
    if (!res.ok) throw new Error("API not ready");
    impactData = await res.json();
  } catch (err) {
    console.error("Failed to fetch global impact data:", err);
    impactData = {
      global: { 
        total_returns_processed: 0, 
        total_co2_saved_kg: 0, 
        total_money_saved_inr: 0,
        total_items_diverted: 0,
        last_updated: new Date().toISOString()
      },
      personal: { 
        total_credits: 0, 
        personal_co2_saved: 0, 
        items_diverted: 0, 
        actions_taken: 0, 
        tier: "Bronze", 
        next_tier_credits: 100, 
        tier_progress_percent: 0 
      },
      credits_breakdown: {
        keep_and_refund: { credits: 0, co2_saved_kg: 0, description: "" },
        buy_refurbished: { credits: 0, co2_saved_kg: 0, description: "" },
        donate: { credits: 0, co2_saved_kg: 0, description: "" },
        return_processed: { credits: 0, co2_saved_kg: 0, description: "" }
      },
      is_mocked: true
    };
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans space-y-12 pb-20">
      
      {/* Header */}
      <div className="space-y-2 text-center md:text-left mt-8 md:mt-4">
        <h1 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">My Impact</h1>
        <p className="text-emerald-700 font-medium">See how your choices are helping build a circular economy.</p>
      </div>

      {/* Personal Metrics & Tier (Client-Side for Session) */}
      <PersonalImpactStats />

      {/* Global Impact Counters */}
      <div className="bg-emerald-950 rounded-2xl p-8 md:p-10 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-[100px] -z-0 translate-x-1/3 -translate-y-1/3 opacity-50" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-emerald-50 mb-8 tracking-tight border-b border-emerald-800/60 pb-4 inline-block">Our Collective Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-emerald-800/50">
            <div className="pt-6 md:pt-0 md:px-6 first:pl-0 first:pt-0 space-y-2">
              <div className="text-4xl font-black text-emerald-100 tracking-tight">{impactData.global.total_returns_processed?.toLocaleString('en-IN') || 0}</div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Returns Processed</div>
            </div>
            <div className="pt-6 md:pt-0 md:px-6 space-y-2">
              <div className="text-4xl font-black text-emerald-100 tracking-tight">{impactData.global.total_co2_saved_kg?.toLocaleString('en-IN') || 0} <span className="text-xl text-emerald-300/80">kg</span></div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total CO₂ Saved</div>
            </div>
            <div className="pt-6 md:pt-0 md:px-6 space-y-2">
              <div className="text-4xl font-black text-emerald-100 tracking-tight">₹{(impactData.global.total_money_saved_inr || 0).toLocaleString('en-IN')}</div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Money Saved by Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Tooltips Section */}
      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-bold text-emerald-950 tracking-tight">How to Earn Green Credits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base">Keep + Refund</h4>
              <p className="text-sm text-emerald-700/80 mt-2 font-medium leading-relaxed">
                Earn credits when you choose to keep a slightly-flawed item with a partial refund instead of shipping it back.
              </p>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base">Buy Refurbished</h4>
              <p className="text-sm text-emerald-700/80 mt-2 font-medium leading-relaxed">
                Earn generous credits every time you purchase an AI-verified refurbished item over a brand new one.
              </p>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base">Donate Items</h4>
              <p className="text-sm text-emerald-700/80 mt-2 font-medium leading-relaxed">
                Earn bonus credits when you authorize a highly damaged return to be routed to local charity instead of the landfill.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
