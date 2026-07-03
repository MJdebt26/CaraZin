import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadCart, addToCart, setCartQty, removeFromCart } from '@/lib/cart-server';

async function authed() {
  const supabase = await createClient();
  if (!supabase) return { error: NextResponse.json({ error: 'Store not configured' }, { status: 503 }) };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) };
  return { supabase, userId: user.id };
}

function fail(e: unknown) {
  const status = (e as { status?: number })?.status ?? 500;
  const message = e instanceof Error ? e.message : 'Cart error';
  return NextResponse.json({ error: message }, { status });
}

// GET /api/cart — current user's cart
export async function GET() {
  const a = await authed();
  if (a.error) return a.error;
  try {
    return NextResponse.json(await loadCart(a.supabase!, a.userId!));
  } catch (e) { return fail(e); }
}

// POST /api/cart { slug, qty? } — add / increment
export async function POST(req: NextRequest) {
  const a = await authed();
  if (a.error) return a.error;
  try {
    const { slug, qty = 1 } = await req.json();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    await addToCart(a.supabase!, a.userId!, slug, Number(qty) || 1);
    return NextResponse.json(await loadCart(a.supabase!, a.userId!));
  } catch (e) { return fail(e); }
}

// PATCH /api/cart { product_id, quantity } — set absolute quantity
export async function PATCH(req: NextRequest) {
  const a = await authed();
  if (a.error) return a.error;
  try {
    const { product_id, quantity } = await req.json();
    if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    await setCartQty(a.supabase!, a.userId!, product_id, Number(quantity));
    return NextResponse.json(await loadCart(a.supabase!, a.userId!));
  } catch (e) { return fail(e); }
}

// DELETE /api/cart { product_id } — remove line
export async function DELETE(req: NextRequest) {
  const a = await authed();
  if (a.error) return a.error;
  try {
    const { product_id } = await req.json();
    if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    await removeFromCart(a.supabase!, a.userId!, product_id);
    return NextResponse.json(await loadCart(a.supabase!, a.userId!));
  } catch (e) { return fail(e); }
}
