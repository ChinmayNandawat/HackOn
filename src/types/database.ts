export interface Product {
  id: string;
  name: string;
  original_price: number;
  category: string;
  image_url: string;
  created_at: string;
}

export interface Return {
  id: string;
  product_id: string;
  status: string;
  return_reason: string;
  image_urls: string[];
  grade: string | null;
  score: number | null;
  flaws: any[] | null;
  confidence: string | null;
  routing_decision: string | null;
  routing_reasoning: string | null;
  estimated_resale_price: number | null;
  created_at: string;
}

export interface ReturnWithProduct extends Return {
  products: Product | null;
}
