import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function OrdersPage() {
  // We'll mock the orders by simply fetching some real products from the DB
  const { data: products } = await supabase.from("products").select("*").limit(3);
  
  const displayOrders = products || [
    { id: "1", title: "Running Shoes", created_at: new Date().toISOString(), image_url: "" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>
      
      <div className="space-y-4">
        {displayOrders.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-slate-200 rounded overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">No Image</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-slate-500">
                    Ordered on {new Date(product.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>
              <Link href={`/returns/new?productId=${product.id}`}>
                <Button variant="outline">Return Item</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
