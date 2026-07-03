import type { SupabaseClient } from '@supabase/supabase-js';
import {
  toPublicProduct, computeTotals, clampQty, MAX_QTY,
  type Product, type CartLine,
} from './cart';

// Load a user's cart with product details + computed totals.
export async function loadCart(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, product:products(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: true });
  if (error) throw error;

  const lines: CartLine[] = (data ?? [])
    .filter((r: { product: unknown }) => r.product)
    .map((r: { quantity: number; product: unknown }) => ({
      product: toPublicProduct(r.product as Product),
      quantity: r.quantity,
    }));
  return { items: lines, totals: computeTotals(lines) };
}

export async function getProductBySlug(supabase: SupabaseClient, slug: string): Promise<Product | null> {
  const { data } = await supabase.from('products').select('*').eq('slug', slug).eq('active', true).single();
  return (data as Product) ?? null;
}

// Add (increment) a product in the user's cart.
export async function addToCart(supabase: SupabaseClient, userId: string, slug: string, addQty = 1) {
  const product = await getProductBySlug(supabase, slug);
  if (!product) throw Object.assign(new Error('Product unavailable'), { status: 400 });

  const { data: existing } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId)
    .eq('product_id', product.id)
    .maybeSingle();

  const nextQty = clampQty((existing?.quantity ?? 0) + addQty, product.stock);
  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: product.id, quantity: nextQty, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,product_id' },
    );
  if (error) throw error;
}

// Set an absolute quantity (<=0 removes the line).
export async function setCartQty(supabase: SupabaseClient, userId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId);
    if (error) throw error;
    return;
  }
  const qty = Math.max(1, Math.min(MAX_QTY, Math.floor(quantity)));
  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, quantity: qty, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,product_id' },
    );
  if (error) throw error;
}

export async function removeFromCart(supabase: SupabaseClient, userId: string, productId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId);
  if (error) throw error;
}
