import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MyReturnsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Returns</h1>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-slate-200 rounded"></div>
              <div>
                <h3 className="font-semibold">Running Shoes</h3>
                <p className="text-sm text-slate-500">Returned on Jun 14, 2026</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Processing AI Decision...</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
