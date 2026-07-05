import { AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";

export interface RefurbishedAlternative {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
}

interface ReturnPreventionBannerProps {
  riskPercent: number;
  reason: string;
  suggestion: string | null;
  refurbishedAlternative: RefurbishedAlternative | null;
}

export default function ReturnPreventionBanner({
  riskPercent,
  reason,
  suggestion,
  refurbishedAlternative,
}: ReturnPreventionBannerProps) {
  if (riskPercent < 25) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-5 shadow-sm space-y-3 relative overflow-hidden my-4">
      <AlertTriangle className="absolute -right-4 -top-4 w-32 h-32 text-amber-500/10 pointer-events-none" />
      
      <div className="flex items-start gap-3 relative z-10">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h3 className="font-bold text-amber-900 text-sm tracking-tight">
            {riskPercent}% of buyers return this — {reason}
          </h3>
          {suggestion && (
            <p className="text-amber-800 text-xs font-semibold flex items-center gap-1.5 bg-amber-100/50 p-2 rounded-md w-fit">
               <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              Try {suggestion} instead
            </p>
          )}
        </div>
      </div>

      {refurbishedAlternative && (
        <div className="mt-4 pt-4 border-t border-amber-200/60 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/40 p-3 rounded-lg gap-4">
          <div className="flex items-center gap-3">
            {refurbishedAlternative.imageUrl && (
              <img src={refurbishedAlternative.imageUrl} alt={refurbishedAlternative.title} className="w-12 h-12 object-cover rounded bg-white shadow-sm" />
            )}
            <div>
              <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-black">Eco Choice</span>
                A certified refurbished version is available!
              </div>
              <div className="text-[10px] text-amber-700 font-medium mt-0.5">{refurbishedAlternative.title}</div>
            </div>
          </div>
          <Link 
            href={`/product/${refurbishedAlternative.id}`}
            className="text-xs font-black text-amber-700 bg-amber-200/50 hover:bg-amber-200 px-4 py-2.5 rounded-md transition-colors whitespace-nowrap w-full sm:w-auto text-center"
          >
            View Refurbished — ₹{(refurbishedAlternative.price).toLocaleString("en-IN")}
          </Link>
        </div>
      )}
    </div>
  );
}
