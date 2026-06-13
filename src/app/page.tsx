import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Disable cache for demo purposes

export default async function Marketplace() {
  // Attempt to fetch from Supabase
  const { data: products, error } = await supabase.from('products').select('*');
  
  // Hardcoded fallback data if Supabase isn't connected yet
  const fallbackProducts = [
    { id: '1', title: 'Wireless Headphones', current_price: 2500, condition: 'new' },
    { id: '2', title: 'Smart Watch (Refurbished)', original_price: 3000, current_price: 1500, condition: 'refurbished', grade: 'A' }
  ];

  const displayProducts = (products && products.length > 0) ? products : fallbackProducts;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>
      <div className="flex gap-2">
        <Badge variant="outline">All</Badge>
        <Badge variant="outline">New Only</Badge>
        <Badge className="bg-green-600">Refurbished</Badge>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
          ⚠️ Supabase not connected. Showing fallback data. (Add your keys to .env.local)
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <Card className={`hover:shadow-md transition cursor-pointer ${product.condition === 'refurbished' ? 'border-green-200' : ''}`}>
              <div className="h-48 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="object-cover w-full h-full" />
                ) : (
                  <span>Image</span>
                )}
                {product.condition === 'refurbished' && (
                  <>
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">AI Verified ✓</Badge>
                    <Badge className="absolute top-2 left-2 bg-slate-900 hover:bg-slate-800">Grade {product.grade}</Badge>
                  </>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className={product.condition === 'refurbished' ? 'text-green-700 font-bold' : 'text-slate-900 font-semibold'}>
                    ₹{product.current_price}
                  </p>
                  {product.condition === 'refurbished' && product.original_price && (
                    <p className="text-slate-400 line-through text-sm">₹{product.original_price}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
