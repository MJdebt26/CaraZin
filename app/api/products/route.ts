import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toPublicProduct, type Product } from '@/lib/cart';

// GET /api/products — active catalog (public read via RLS).
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Store not configured' }, { status: 503 });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data as Product[]).map(toPublicProduct));
}
