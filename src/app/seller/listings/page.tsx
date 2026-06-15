import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import ListingStatusActions from "./ListingStatusActions";
import SellerNav from "@/components/SellerNav";
import { FileText, Tag, TrendingUp, IndianRupee } from "lucide-react";

export const revalidate = 0;

export default async function SellerListings() {
  let isMocked = false;
  
  // Static Fallbacks
  let totalActive = 1;
  let totalRevenue = 1500;
  let avgDiscount = 45;
  let listings: any[] = [{
    id: "demo-1",
    title: "Smart Watch (Refurbished)",
    category: "Electronics",
    original_price: 3000,
    estimated_resale_price: 1500,
    savingsPct: 50,
    relist_status: "active",
    relisted_at: new Date().toISOString(),
    health_data: { grade: "A", score: 92 },
    image_url: null,
    returnReason: "Wrong size"
  }];

  try {
    // 1. Fetch refurbished products
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("is_refurbished", true)
      .order("relisted_at", { ascending: false });

    if (prodErr) throw prodErr;

    if (products && products.length > 0) {
      // 2. Fetch associated returns using parent_product_id
      const parentIds = products.map(p => p.parent_product_id).filter(Boolean);
      let returnMap: Record<string, any> = {};
      
      if (parentIds.length > 0) {
        const { data: returnsData } = await supabase
          .from("returns")
          .select("product_id, reason, return_reason, created_at")
          .in("product_id", parentIds);
          
        if (returnsData) {
          returnsData.forEach(r => {
            returnMap[r.product_id] = r;
          });
        }
      }

      // 3. Process the data
      let activeCount = 0;
      let revenueSum = 0;
      let totalDiscountPct = 0;
      let discountCount = 0;

      listings = products.map(p => {
        const status = p.relist_status || "active";
        const estimated = p.estimated_resale_price || 0;
        const original = p.original_price || 0;
        
        let savingsPct = 0;
        if (original > 0 && estimated > 0) {
          savingsPct = Math.round(((original - estimated) / original) * 100);
        }

        if (status === 'active') {
          activeCount++;
          revenueSum += estimated;
        }

        if (savingsPct > 0) {
          totalDiscountPct += savingsPct;
          discountCount++;
        }

        const relatedReturn = p.parent_product_id ? returnMap[p.parent_product_id] : null;

        return {
          ...p,
          savingsPct,
          status,
          returnReason: relatedReturn?.reason || relatedReturn?.return_reason || "Unknown",
        };
      });

      totalActive = activeCount;
      totalRevenue = revenueSum;
      avgDiscount = discountCount > 0 ? Math.round(totalDiscountPct / discountCount) : 0;
    } else {
      listings = [];
    }
  } catch (err) {
    console.error("Failed to fetch listings:", err);
    isMocked = true;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Refurbished Listings</h1>
          <p className="text-slate-500 mt-1">Manage your active, pending, and sold inventory.</p>
        </div>
        {isMocked ? (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">Demo Data</Badge>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-bold">Live Data</Badge>
        )}
      </div>

      <SellerNav />
      
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Listings</p>
              <p className="text-4xl font-black mt-2 text-slate-900">{totalActive}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Tag className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Revenue Potential</p>
              <p className="text-4xl font-black mt-2 text-emerald-600">₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Avg Discount</p>
              <p className="text-4xl font-black mt-2 text-indigo-600">{avgDiscount}%</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {listings.length === 0 && !isMocked ? (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No refurbished listings yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs">
              Process a return and click Relist as Refurbished to create your first listing.
            </p>
            <Link href="/seller/returns" className="text-blue-600 font-bold hover:underline text-sm">
              Go to Returns Dashboard &rarr;
            </Link>
          </div>
        ) : (
          listings.map((item) => {
            const grade = item.health_data?.grade || "N/A";
            const score = item.health_data?.score || 0;
            const listedPrice = item.estimated_resale_price || 0;
            const originalPrice = item.original_price || 0;
            const dateStr = item.relisted_at || item.created_at || new Date().toISOString();
            const daysAgo = formatDistanceToNow(new Date(dateStr));
            
            return (
              <Card key={item.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0 sm:flex items-stretch">
                  {/* Left Side: Image & Core Info */}
                  <div className="p-5 flex-1 flex gap-5 items-center sm:border-r border-slate-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs shrink-0 font-bold">No Img</div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.category || "General"}</span>
                        {item.savingsPct > 0 && (
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[10px] py-0">
                            {item.savingsPct}% OFF
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-black text-slate-900 text-lg truncate">{item.title}</h3>
                      
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-lg font-bold text-slate-900">₹{listedPrice.toLocaleString("en-IN")}</p>
                          {originalPrice > 0 && <p className="text-xs font-medium text-slate-400 line-through">₹{originalPrice.toLocaleString("en-IN")}</p>}
                        </div>
                        <span className="text-slate-300">|</span>
                        <Badge className="bg-slate-900 font-bold">Grade {grade}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Status & Actions */}
                  <div className="p-5 sm:w-64 bg-slate-50 flex flex-col justify-between items-end gap-4 shrink-0">
                    <ListingStatusActions productId={item.id} initialStatus={item.status} />
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Listed {daysAgo} ago</p>
                      {item.returnReason !== "Unknown" && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]" title={item.returnReason}>
                          From return: "{item.returnReason}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
