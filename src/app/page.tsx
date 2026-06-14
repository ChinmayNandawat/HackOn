import { supabase } from "@/lib/supabase";
import MarketplaceClient from "./MarketplaceClient";

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
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm mb-4">
          ⚠️ Supabase not connected. Showing fallback data. (Add your keys to .env.local)
        </div>
      )}
      <MarketplaceClient products={displayProducts} />
    </div>
  );
}
