import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadCart, addToCart } from '@/lib/cart-server';

// POST /api/cart/merge { items: [{ slug, qty }] }
// Folds a guest (localStorage) cart into the signed-in user's cart on login.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Store not configured' }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const { items } = await req.json();
    if (Array.isArray(items)) {
      for (const it of items) {
        const slug = it?.slug;
        const qty = Number(it?.qty) || 0;
        if (slug && qty > 0) {
          try { await addToCart(supabase, user.id, slug, qty); } catch { /* skip unknown/inactive */ }
        }
      }
    }
    return NextResponse.json(await loadCart(supabase, user.id));
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Merge failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
