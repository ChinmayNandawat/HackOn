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
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Sparx Mens Flip Flop 7 UK', description: 'Comfortable, durable and stylish everyday flip flops by Sparx.', original_price: 499.00, current_price: 499.00, category: 'Footwear', image_url: 'https://m.media-amazon.com/images/I/61dgP8XDIoL._SY695_.jpg', condition: 'new', return_risk_score: 10, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Puma Unisex Adult Max Slide', description: 'Sleek design and premium comfort for your casual wear.', original_price: 1499.00, current_price: 1499.00, category: 'Footwear', image_url: 'https://m.media-amazon.com/images/I/51utcv6JMNL._SY695_.jpg', condition: 'new', return_risk_score: 12, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Apple iPhone 16e 128GB', description: 'The latest iPhone 16e features an advanced camera system, incredible battery life, and powerful performance.', original_price: 65900.00, current_price: 65900.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/31YrZL046rL._SX342_SY445_QL70_FMwebp_.jpg', condition: 'new', return_risk_score: 15, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Apple iPad 11" A16 Chip', description: 'Powerful and versatile. The new iPad 11-inch with the A16 Bionic chip handles everything with ease.', original_price: 39900.00, current_price: 39900.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/41vE9cIx29L._SY300_SX300_QL70_FMwebp_.jpg', condition: 'new', return_risk_score: 10, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Apple MacBook Air M2', description: 'Supercharged by M2. Features a strikingly thin design, brilliant Liquid Retina display, and incredible performance.', original_price: 89900.00, current_price: 89900.00, category: 'Electronics', image_url: 'https://m.media-amazon.com/images/I/61dLund7bhL._SX679_.jpg', condition: 'new', return_risk_score: 8, is_refurbished: false, relist_status: 'active' },
    { seller_id: '00000000-0000-0000-0000-000000000001', title: 'Nike Mens Downshifter 14 Running Shoes', description: 'Reliable and comfortable running shoes that provide excellent support for your daily miles.', original_price: 3495.00, current_price: 3495.00, category: 'Footwear', image_url: 'https://m.media-amazon.com/images/I/61U2wikE1gL._AC_SX679_.jpg', condition: 'new', return_risk_score: 18, is_refurbished: false, relist_status: 'active' }
  ];

  const res = await supabase.from('products').insert(products);
  if (res.error) {
    console.error('Insert error:', res.error);
  } else {
    console.log('Inserted successfully!');
  }
}
run();
