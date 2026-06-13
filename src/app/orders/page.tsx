import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-slate-200 rounded"></div>
              <div>
                <h3 className="font-semibold">Running Shoes</h3>
                <p className="text-sm text-slate-500">Ordered on Jun 12, 2026</p>
              </div>
            </div>
            <Link href="/return/ord_123">
              <Button variant="outline">Return Item</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
