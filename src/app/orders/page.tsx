import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function OrdersPage() {
  // Fetch real orders from the DB
  let orders: any[] = [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, products(id, title, image_url)")
      .eq("buyer_id", "00000000-0000-0000-0000-000000000002")
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      orders = data;
    }
  } catch (err) {
    console.error("Orders fetch failed (migration missing?):", err);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
          <Link href="/">
            <Button className="mt-4 bg-slate-900 text-white">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const product = Array.isArray(order.products) ? order.products[0] : order.products;
            if (!product) return null;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0 sm:flex items-stretch">
                  <div className="p-5 flex-1 flex gap-5 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">No Image</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{product.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Ordered on {new Date(order.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:w-64 bg-slate-50 flex items-center justify-end sm:border-l border-slate-100">
                    <Link href={`/returns/new?productId=${product.id}`}>
                      <Button variant="outline" className="font-bold w-full sm:w-auto">Return Item</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
