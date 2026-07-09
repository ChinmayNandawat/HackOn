"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ReturnWithProduct } from "@/types/database";
import SellerNav from "@/components/SellerNav";
import AutomatedOverrideCard from "@/components/seller/AutomatedOverrideCard";
import { AlertCircle } from "lucide-react";
import { SellerAutomationProvider } from "@/context/SellerAutomationContext";

export default function SellerAutomationPage() {
  const [returns, setReturns] = useState<ReturnWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: rawData, error: fetchError } = await supabase
          .from("returns")
          .select(`
            *,
            products (
              id,
              title,
              original_price,
              category,
              image_url,
              created_at
            )
          `)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        const mappedData: ReturnWithProduct[] = (rawData || []).map((rawItem: any) => ({
          ...rawItem,
          products: rawItem.products ? {
            ...rawItem.products,
            original_price: Number(rawItem.products.original_price),
          } : null
        }));

        setReturns(mappedData);
      } catch (err: any) {
        console.error("Error fetching returns for automation:", err);
        setError(err?.message || "Failed to load automation data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <SellerAutomationProvider>
      <main className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Automation Studio</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure how the ReLife AI handles your returns automatically.
            </p>
          </header>



          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>Error: {error}</p>
            </div>
          )}

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <AutomatedOverrideCard returns={returns} />
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">More Automation Rules Coming Soon</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  In the future, you will be able to configure auto-relist pricing strategies and category-specific routing rules.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </SellerAutomationProvider>
  );
}
