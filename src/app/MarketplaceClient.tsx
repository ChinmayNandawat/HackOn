"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  original_price?: number;
  estimated_resale_price?: number;
  current_price?: number; // fallback
  condition: string;
  is_refurbished?: boolean;
  grade?: string;
  image_url?: string;
}

export default function MarketplaceClient({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | "new" | "refurbished">("all");

  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true;
    const isRefurbished = product.condition === "refurbished" || product.is_refurbished;
    if (filter === "refurbished") return isRefurbished;
    if (filter === "new") return !isRefurbished;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketplace</h1>
      </div>
      
      <div className="flex gap-2">
        <button onClick={() => setFilter("all")}>
          <Badge variant={filter === "all" ? "default" : "outline"} className={filter === "all" ? "bg-slate-900" : ""}>
            All
          </Badge>
        </button>
        <button onClick={() => setFilter("new")}>
          <Badge variant={filter === "new" ? "default" : "outline"} className={filter === "new" ? "bg-slate-900" : ""}>
            New Only
          </Badge>
        </button>
        <button onClick={() => setFilter("refurbished")}>
          <Badge 
            variant={filter === "refurbished" ? "default" : "outline"} 
            className={filter === "refurbished" ? "bg-green-600 hover:bg-green-700 text-white border-transparent" : "text-green-700 border-green-200 bg-green-50"}
          >
            Refurbished
          </Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isRefurb = product.condition === 'refurbished' || product.is_refurbished;
          
          return (
            <Link href={`/product/${product.id}`} key={product.id}>
              <Card className={`hover:shadow-md transition cursor-pointer ${isRefurb ? 'border-green-200' : ''}`}>
                <div className="h-48 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-slate-400 font-medium">No Image</span>
                  )}
                  {isRefurb && (
                    <>
                      <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">AI Verified ✓</Badge>
                      {product.grade && (
                        <Badge className="absolute top-2 left-2 bg-slate-900 hover:bg-slate-800">Grade {product.grade}</Badge>
                      )}
                    </>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={isRefurb ? 'text-green-700 font-bold' : 'text-slate-900 font-semibold'}>
                      ₹{(isRefurb ? product.estimated_resale_price : product.original_price) || product.current_price || 0}
                    </p>
                    {isRefurb && product.original_price && (
                      <p className="text-slate-400 line-through text-sm">₹{product.original_price}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No products found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
