const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://mmxatnqbkehlifxozqcm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teGF0bnFia2VobGlmeG96cWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjU1NTAsImV4cCI6MjA5Njk0MTU1MH0.9gzOzBLfcsgMwKoBkHz1tY6dOmiiIhP2tPNXP-FbeRc');

async function run() {
  console.log('Deleting logs...');
  await supabase.from('green_credits_log').delete().neq('id', 'dummy');
  console.log('Deleting orders...');
  await supabase.from('orders').delete().neq('id', 'dummy');
  console.log('Deleting returns...');
  await supabase.from('returns').delete().neq('id', 'dummy');
  console.log('Deleting products...');
  await supabase.from('products').delete().neq('id', 'dummy');
  
  console.log('Updating stats...');
  await supabase.from('platform_stats').update({
    total_returns_processed: 0,
    total_co2_saved_kg: 0,
    total_money_saved_inr: 0,
    total_items_diverted: 0
  }).eq('id', 1);

  console.log('Inserting products...');
  const products = [
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Portronics Mport One USB C Hub Dock', description: 'Multi-port USB C hub for all your connectivity needs.', original_price: 1299.00, current_price: 1299.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/41N7a-z09fL.jpg', condition: 'new', return_risk_score: 5, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Samsung 22" (54.6 cm) S3 Flat Monitor', description: 'Crisp, clear visuals with Samsung S3 Flat Monitor.', original_price: 6500.00, current_price: 6500.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/71JwKnROg8L._SX679_.jpg', condition: 'new', return_risk_score: 8, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'DIGIROOT iPad Pencil', description: 'High-precision stylus pen for iPad.', original_price: 1999.00, current_price: 1999.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/51UBr3cmxOL._SX679_.jpg', condition: 'new', return_risk_score: 5, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Original Air Conditioner Remote Control', description: 'Universal replacement remote control for Air Conditioners.', original_price: 500.00, current_price: 500.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/51UBr3cmxOL._SX679_.jpg', condition: 'new', return_risk_score: 2, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Zebronics Zeb-Crystal Clear Web Camera', description: 'Crystal clear video calls with Zebronics Web Camera.', original_price: 899.00, current_price: 899.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/71qnZFqFM9L._SX679_.jpg', condition: 'new', return_risk_score: 4, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Boat Nirvana Ion ANC Pro, Hi-Res Audio', description: 'Immersive audio experience with Active Noise Cancellation.', original_price: 2999.00, current_price: 2999.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/71plvQVaULL._SX679_.jpg', condition: 'new', return_risk_score: 6, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Richy Toys White Dog Cute Plush', description: 'Adorable white dog plush toy, incredibly soft.', original_price: 499.00, current_price: 499.00, category: 'Home', image_url: 'https://m.media-amazon.com/images/I/71jJv5eE7XL._SX679_.jpg', condition: 'new', return_risk_score: 2, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Samsung Original 25W USB Type-C Travel Adaptor', description: 'Super fast charging 25W adapter by Samsung.', original_price: 1199.00, current_price: 1199.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/512UVkoMMEL._SX679_.jpg', condition: 'new', return_risk_score: 3, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Tribit XFree Go', description: 'High fidelity wireless headphones with exceptional battery life.', original_price: 2599.00, current_price: 2599.00, category: 'Electronics', image_url: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcThD-DFFUevDTgQPtgmmcQ7uRBCCk4Hj8qolh2zlNew3FaauBIg2H_wX5arSUOpeFLy9dhG4VkjxBR3oWi9jNUFA0cl99Ukg-jPN4yCmym_', condition: 'new', return_risk_score: 5, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'EvoFox Elite X Gaming Controller for PC', description: 'Precision gaming controller with ergonomic design.', original_price: 1499.00, current_price: 1499.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/41zsXOJslQL._SX342_SY445_QL70_FMwebp_.jpg', condition: 'new', return_risk_score: 6, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Nothing Phone (2a) (White, 128 GB)', description: 'Innovative transparent design with powerful performance.', original_price: 23999.00, current_price: 23999.00, category: 'Electronics', image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyUayGmK0LkHzsw9fFdk9VnYPj2DNpX2K64WGf149Wxg&s=10', condition: 'new', return_risk_score: 12, is_refurbished: false, relist_status: 'active' }
  ];

  const res = await supabase.from('products').insert(products);
  if (res.error) {
    console.error('Insert error:', res.error);
  } else {
    console.log('Inserted successfully!');
  }
}
run();
