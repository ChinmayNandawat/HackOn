import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-64 bg-slate-200 rounded-lg flex items-center justify-center">
        Product Image Placeholder
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Product Name</h1>
        <p className="text-xl">₹2,500</p>
        
        {/* Return Prevention Banner Placeholder */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-amber-800 font-medium flex items-center gap-2">
              <span className="text-xl">⚠️</span> High Return Risk
            </p>
            <p className="text-sm text-amber-700 mt-1">
              73% of buyers return this because it runs small. We recommend Size 10 instead.
            </p>
            <Link href="/product/refurb" className="text-sm text-amber-900 underline mt-2 block">
              View a Grade-A refurbished version for 40% off
            </Link>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg">Add to Cart</Button>
      </div>
    </div>
  );
}
