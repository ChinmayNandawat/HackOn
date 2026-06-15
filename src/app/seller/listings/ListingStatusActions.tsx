import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ListingStatusActions({ productId, initialStatus }: { productId: string, initialStatus: string }) {
  // initialStatus comes directly from the DB product.relist_status
  // 'active' or 'sold'

  const badgeClass = 
    initialStatus === 'active' ? "bg-emerald-100 text-emerald-800 border-none px-3 font-bold uppercase tracking-wider" :
    initialStatus === 'sold' ? "bg-slate-200 text-slate-600 border-none px-3 font-bold uppercase tracking-wider" :
    "bg-amber-100 text-amber-800 border-none px-3 font-bold uppercase tracking-wider";

  return (
    <div className="flex flex-col items-end gap-3 text-right">
      <Badge className={badgeClass}>
        {initialStatus.charAt(0).toUpperCase() + initialStatus.slice(1)}
      </Badge>
      
      <div className="flex items-center gap-2">
        <Link href={`/product/${productId}`}>
          <Button variant="outline" size="sm" className="font-bold text-slate-600 hover:bg-slate-100">
            View Listing
          </Button>
        </Link>
      </div>
    </div>
  );
}
