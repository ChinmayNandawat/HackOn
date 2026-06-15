import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getReturnRiskData } from "@/lib/mock-prevention";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  let product = null;
  let errorMsg = null;
  let refurbishedAlternative: any = null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        product = null;
      } else {
        throw error;
      }
    } else {
      product = data;
    }
    
    // Fetch a refurbished alternative if this is a new product
    if (product && !product.is_refurbished) {
      const { data: altData } = await supabase
        .from("products")
        .select("id, estimated_resale_price, health_data")
        .eq("parent_product_id", productId)
        .eq("is_refurbished", true)
        .limit(1)
        .maybeSingle();
        
      if (altData) {
        refurbishedAlternative = {
          id: altData.id,
          title: product?.title || "Refurbished Version",
          price: altData.estimated_resale_price || 0,
          imageUrl: product?.image_url || null
        };
      }
    }
  } catch (err: unknown) {
    console.error("Failed to fetch product:", err);
    errorMsg = "Failed to load product details. Please try again.";
  }

  // Error State
  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
        <p className="text-red-700 mb-6">{errorMsg}</p>
        <Link href="/" className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700">
          Go Back
        </Link>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn&apos;t find the product you&apos;re looking for.</p>
        <Link href="/" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm inline-flex items-center gap-2 hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  // Get risk data
  const riskData = getReturnRiskData(product.id, product.return_risk_score, product.category);

  return (
    <ProductDetailClient 
      product={product} 
      riskData={riskData} 
      refurbishedAlternative={refurbishedAlternative} 
    />
  );
}
