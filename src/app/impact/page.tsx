import { Card, CardContent } from "@/components/ui/card";

export default function ImpactDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Impact</h1>
        <div className="bg-gradient-to-r from-green-400 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Gold Tier
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-6 text-center">
            <p className="text-emerald-800 text-sm font-medium">Items Diverted</p>
            <p className="text-4xl font-bold text-emerald-600 mt-2">3</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-blue-800 text-sm font-medium">CO₂ Saved</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">7.2 kg</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6 text-center">
            <p className="text-amber-800 text-sm font-medium">Green Credits</p>
            <p className="text-4xl font-bold text-amber-600 mt-2">150</p>
            <p className="text-amber-700 text-xs mt-1">Value: ₹75</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
