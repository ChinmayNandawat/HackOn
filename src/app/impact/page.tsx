import PersonalImpactStats from "@/components/PersonalImpactStats";
import ImpactLeaderboard from "@/components/ImpactLeaderboard";
import { RefreshCcw, ShieldCheck, HeartHandshake, Globe, Leaf, TrendingUp } from "lucide-react";

export default function ImpactPage() {
  // Hardcoded platform-wide stats for demo
  const platformStats = {
    returns_processed: "12,400",
    co2_saved: "2.1",
    money_recovered: "38",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans space-y-10 pb-20">
        
        {/* Header */}
        <div className="space-y-2 text-center md:text-left mt-8 md:mt-4">
          <div className="flex items-center gap-2.5 justify-center md:justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Impact</h1>
          </div>
          <p className="text-sm text-gray-500">See how your choices are helping build a circular economy.</p>
        </div>

        {/* Personal Metrics & Tier */}
        <PersonalImpactStats />

        {/* Community Leaderboard */}
        <ImpactLeaderboard />

        {/* Platform-wide stats — light compact banner */}
        <div className="bg-gray-50 rounded-2xl p-5 md:p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platform-wide Impact</span>
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-black text-gray-900">{platformStats.returns_processed}</div>
              <div className="text-[10px] md:text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">Returns Processed</div>
            </div>
            <div className="text-center md:text-left border-x border-gray-200 px-2">
              <div className="text-2xl md:text-3xl font-black text-gray-900">{platformStats.co2_saved} <span className="text-sm md:text-base text-gray-400 font-bold">tonnes</span></div>
              <div className="text-[10px] md:text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">CO₂ Saved</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-black text-gray-900">₹{platformStats.money_recovered} <span className="text-sm md:text-base text-gray-400 font-bold">lakhs</span></div>
              <div className="text-[10px] md:text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">Value Recovered</div>
            </div>
          </div>
        </div>

        {/* How to Earn Green Credits */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">How to Earn Green Credits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100 group-hover:border-emerald-500">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Keep + Refund</h4>
              <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">
                Earn credits when you keep a slightly-flawed item with a partial refund instead of shipping it back.
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100 group-hover:border-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Buy Refurbished</h4>
              <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">
                Earn generous credits every time you purchase an AI-verified refurbished item over a brand new one.
              </p>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all border border-emerald-100 group-hover:border-emerald-500">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Donate Items</h4>
              <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">
                Earn bonus credits when you route a highly damaged return to local charity instead of the landfill.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
