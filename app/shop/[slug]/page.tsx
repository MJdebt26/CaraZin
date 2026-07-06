import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';
import AddToCart from '@/components/AddToCart';
import { getProductBySlug, getProducts } from '@/lib/products-server';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return { title: p ? `${p.name} · CARAZIN` : 'Product · CARAZIN' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts()).filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="pdp-main">
        <Link href="/shop" className="pdp-back">← All products</Link>

        <div className="pdp">
          <div className="pdp-media">
            {product.image ? <img src={product.image} alt={product.name} /> : <div className="pdp-noimg" />}
          </div>

          <div className="pdp-info">
            {product.badge && <div className="pdp-badge">{product.badge}</div>}
            <h1 className="pdp-name">{product.name}</h1>
            <div className="pdp-price">${product.price.toFixed(2)}</div>
            {product.fitment && (
              <div className="pdp-fit"><span>Fitment</span> {product.fitment}</div>
            )}
            <p className="pdp-desc">{product.description}</p>

            <AddToCart slug={product.slug} inStock={product.inStock} max={Math.min(20, product.stock)} />

            <div className="pdp-meta">
              <div className={`pdp-stock ${product.inStock ? 'in' : 'out'}`}>
                {product.inStock ? `In stock — ${product.stock} available` : 'Currently sold out'}
              </div>
              <ul className="pdp-perks">
                <li>Free shipping over $150 · flat $9.99 otherwise</li>
                <li>Ships from Vancouver, BC · 2–3 day Metro delivery</li>
                <li>30-day returns</li>
              </ul>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pdp-related">
            <div className="sec-eyebrow">More from the collection</div>
            <div className="shop-grid">
              {related.map((p) => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="shop-card">
                  <div className="shop-card-img">
                    {p.image ? <img src={p.image} alt={p.name} /> : <div className="shop-card-noimg" />}
                  </div>
                  <div className="shop-card-body">
                    <div className="shop-card-name">{p.name}</div>
                    <div className="shop-card-price">${p.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
