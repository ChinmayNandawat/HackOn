export interface Product {
  id: string;
  title: string;
  original_price: number;
  category: string;
  image_url: string;
  created_at: string;
  is_refurbished?: boolean;
  parent_product_id?: string | null;
  health_data?: {
    grade?: string | null;
    score?: number | null;
    flaws?: any[] | null;
    confidence?: string | null;
    summary?: string | null;
    generatedDescription?: string | null;
    sellerNote?: string | null;
    return_photo_urls?: string[];
  };
  estimated_resale_price?: number | null;
  relist_status?: string | null;
  relisted_at?: string | null;
}

export interface Return {
  id: string;
  product_id: string;
  buyer_id: string;
  status: 'processing' | 'inspected' | 'accepted' | 'standard_refund' | 'relisted' | 'rejected' | 'completed';
  return_reason: string;
  image_urls: string[];
  grade: string | null;
  score: number | null;
  flaws: any[] | null;
  confidence: string | null;
  routing_decision: string | null;
  routing_reasoning: string | null;
  estimated_resale_price: number | null;
  flaws_json?: any;
  created_at: string;
}

export interface ReturnWithProduct extends Return {
  products: Product | null;
}
