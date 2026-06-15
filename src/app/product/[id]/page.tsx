import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductHealthCard from "@/components/ProductHealthCard";
import BuyRefurbishedButton from "@/components/BuyRefurbishedButton";
import BuyNewButton from "@/components/BuyNewButton";
import ReturnPreventionBanner from "@/components/ReturnPreventionBanner";
import { getReturnRiskData } from "@/lib/mock-prevention";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

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

  const isRefurbished = product.is_refurbished === true;
  
  // Get risk data
  const riskData = getReturnRiskData(product.id, product.return_risk_score);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 font-sans pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-semibold mb-2">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>→</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-900 transition-colors">
          {product.category}
        </Link>
        <span>→</span>
        <span className="text-gray-900 truncate">{product.title}</span>
      </nav>

      {/* Header Info */}
      <div className="space-y-2">
        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-extrabold uppercase tracking-widest">
          {product.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
          {product.title}
        </h1>
        <div className="flex items-end gap-3 mt-4">
          {isRefurbished ? (
            <>
              <span className="text-4xl font-black text-emerald-600">
                ₹{(product.estimated_resale_price || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-lg font-bold text-gray-400 line-through mb-1">
                ₹{(product.original_price || 0).toLocaleString("en-IN")}
              </span>
            </>
          ) : (
            <span className="text-4xl font-black text-gray-900">
              ₹{(product.original_price || 0).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      {/* RETURN PREVENTION BANNER */}
      {!isRefurbished && (
        <ReturnPreventionBanner 
          riskPercent={riskData.riskPercent}
          reason={riskData.reason}
          suggestion={riskData.suggestion}
          refurbishedAlternative={refurbishedAlternative}
        />
      )}

      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.image_url || 'https://via.placeholder.com/600'} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Transparency Report / Health Card */}
      {isRefurbished && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4 opacity-80">
            <div className="h-px bg-gray-300 flex-1" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              Product Transparency Report
            </h3>
            <div className="h-px bg-gray-300 flex-1" />
          </div>
          
          <ProductHealthCard product={product} showFullDetail={true} />
        </div>
      )}

      {/* Add to Cart / Buy Button */}
      <div className="pt-6">
        {product.relist_status === 'sold' ? (
          <Button disabled className="w-full py-7 text-lg font-black tracking-wide rounded-xl shadow-xl bg-slate-200 text-slate-500 opacity-70">
            Sold Out
          </Button>
        ) : isRefurbished ? (
          <BuyRefurbishedButton 
            productId={product.id}
            originalPrice={product.original_price}
            estimatedResalePrice={product.estimated_resale_price || 0}
          />
        ) : (
          <BuyNewButton productId={product.id} />
        )}
      </div>
    </div>
  );
}
