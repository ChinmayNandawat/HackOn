import { Card, CardContent } from "@/components/ui/card";

export default function SellerAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Intelligence</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm font-medium">Auto-Processed Returns</p>
            <p className="text-3xl font-bold mt-2">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm font-medium">Revenue Recovered</p>
            <p className="text-3xl font-bold mt-2 text-green-600">₹18,500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-500 text-sm font-medium">Time Saved (est.)</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">3 hrs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-900">AI Suggestion</h3>
          <p className="text-amber-800 mt-1">34% of your returns are due to "Wrong Size". Consider adding a detailed sizing chart to your product descriptions to prevent future returns.</p>
        </CardContent>
      </Card>
    </div>
  );
}
