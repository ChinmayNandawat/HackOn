import { supabase } from "@/lib/supabase";
import MarketplaceClient from "./MarketplaceClient";

export const revalidate = 0; // Disable cache for demo purposes

export default async function Marketplace() {
  // Attempt to fetch from Supabase
  const { data: products, error } = await supabase.from('products').select('*');
  
  const displayProducts = products || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm mb-4">
          Supabase not connected or query failed. (Add your keys to .env.local)
        </div>
      )}
      <MarketplaceClient products={displayProducts} />
    </div>
  );
}
