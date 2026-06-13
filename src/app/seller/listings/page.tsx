import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SellerListings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Refurbished Listings</h1>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-xs">Image</div>
              <div>
                <h3 className="font-semibold">Smart Watch (Refurbished)</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium">₹1,500</p>
                  <Badge className="bg-slate-900">Grade A</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>
              <p className="text-xs text-slate-500 mt-2">12 views</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
