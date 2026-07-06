import { createClient } from '@/lib/supabase/server';
import { toPublicProduct, type Product, type PublicProduct } from '@/lib/cart';

// Server-side catalog reads (public products, RLS allows anon select).
export async function getProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from('products').select('*').eq('active', true).order('sort', { ascending: true });
  return (data as Product[] ?? []).map(toPublicProduct);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle();
  return data ? toPublicProduct(data as Product) : null;
}
