'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Stars from './Stars';
import type { PublicProduct } from '@/lib/cart';
import type { Rating } from '@/lib/reviews';

export type ShopItem = PublicProduct & { rating: Rating };

const CATEGORY_LABELS: Record<string, string> = {
  lighting: 'Ambient Lighting',
  electronics: 'Electronics',
  connectivity: 'Connectivity',
  keys: 'Display Keys',
  exterior: 'Exterior',
};
const CATEGORY_ORDER = ['lighting', 'electronics', 'connectivity', 'keys', 'exterior'];

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
];

export default function ShopBrowser({ products, initialCat }: { products: ShopItem[]; initialCat?: string }) {
  const cats = useMemo(
    () => CATEGORY_ORDER.filter((c) => products.some((p) => p.category === c)),
    [products],
  );
  const validInitial = initialCat && cats.includes(initialCat) ? initialCat : 'all';
  const [cat, setCat] = useState<string>(validInitial);
  const [sort, setSort] = useState<SortKey>('featured');

  const visible = useMemo(() => {
    let list = cat === 'all' ? products : products.filter((p) => p.category === cat);
    list = [...list];
    if (sort === 'price-asc') list.sort((a, b) => a.price_cents - b.price_cents);
    else if (sort === 'price-desc') list.sort((a, b) => b.price_cents - a.price_cents);
    else if (sort === 'rating') list.sort((a, b) => b.rating.value - a.rating.value || b.rating.count - a.rating.count);
    return list;
  }, [products, cat, sort]);

  return (
    <>
      <div className="shop-toolbar">
        <div className="shop-filters" role="tablist" aria-label="Filter by category">
          <button className={`shop-chip ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>
            All <span className="shop-chip-n">{products.length}</span>
          </button>
          {cats.map((c) => {
            const n = products.filter((p) => p.category === c).length;
            return (
              <button key={c} className={`shop-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
                {CATEGORY_LABELS[c] || c} <span className="shop-chip-n">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="shop-sort">
          <label htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <p className="shop-count">
        {visible.length} {visible.length === 1 ? 'product' : 'products'}
        {cat !== 'all' && <> in <strong>{CATEGORY_LABELS[cat]}</strong></>}
      </p>

      {visible.length === 0 ? (
        <p className="shop-empty">Nothing here yet — try another category.</p>
      ) : (
        <div className="shop-grid" key={`${cat}-${sort}`}>
          {visible.map((p, i) => (
            <Link key={p.id} href={`/shop/${p.slug}`} className="shop-card reveal-card" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <div className="shop-card-img">
                {p.image ? <img src={p.image} alt={p.name} /> : <div className="shop-card-noimg" />}
                {p.badge && <span className="shop-card-badge">{p.badge}</span>}
                {!p.inStock && <span className="shop-card-sold">Sold out</span>}
              </div>
              <div className="shop-card-body">
                <div className="shop-card-name">{p.name}</div>
                {p.fitment && <div className="shop-card-fit">{p.fitment}</div>}
                <div className="shop-card-rating">
                  <Stars value={p.rating.value} size={11} />
                  <span className="rc-count">{p.rating.value.toFixed(1)} ({p.rating.count})</span>
                </div>
                <div className="shop-card-price">${p.price.toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
