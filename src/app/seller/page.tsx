import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Returns Dashboard</h1>
        <div className="flex gap-4">
          <Button variant="outline">My Listings</Button>
          <Button variant="outline">Analytics</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order #ORD-789 - Wireless Headphones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Comparison */}
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-100 h-48 rounded-lg flex items-center justify-center">Original</div>
                <div className="flex-1 bg-slate-200 h-48 rounded-lg relative flex items-center justify-center">
                  <span className="absolute text-xs top-1 left-1 bg-red-500 text-white px-1 rounded">AI Detected Flaw</span>
                  Returned
                </div>
              </div>

              {/* AI Report */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className="bg-slate-900">Grade B</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200">Confidence: High</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700">AI Routing Decision</h4>
                  <p className="text-lg font-bold text-blue-700">Return to Seller (Resellable)</p>
                  <p className="text-sm text-slate-500">Item has minor scuffs but is fully functional.</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Relist as Refurbished</Button>
                  <Button variant="outline" className="flex-1">Override</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
