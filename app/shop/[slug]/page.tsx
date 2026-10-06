import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';
import AddToCart from '@/components/AddToCart';
import TrustRow from '@/components/TrustRow';
import Stars from '@/components/Stars';
import ProductReviews from '@/components/ProductReviews';
import { getProductBySlug, getProducts } from '@/lib/products-server';
import { getRating } from '@/lib/reviews';
import { getSpecs, getHighlights } from '@/lib/product-detail';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: 'Product · CARAZIN' };
  return {
    title: `${p.name} · CARAZIN`,
    description: p.description,
    openGraph: {
      title: `${p.name} · CARAZIN`,
      description: p.description,
      images: p.image ? [{ url: p.image }] : undefined,
      type: 'website',
    },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carazin.com';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts()).filter((p) => p.slug !== product.slug).slice(0, 4);
  const rating = getRating(product.slug);
  const specs = getSpecs(product);
  const highlights = getHighlights(product);

  // Product structured data — lets Google render rich results (rating, price, stock).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image ? [`${SITE_URL}${product.image}`] : undefined,
    brand: { '@type': 'Brand', name: 'Carazin' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.value,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      price: product.price.toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/shop/${product.slug}`,
      seller: { '@type': 'Organization', name: 'Carazin' },
    },
  };

  return (
    <div className="site-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AnnouncementBar />
      <SiteHeader />
      <main className="pdp-main">
        <nav className="pdp-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <span className="pdp-crumb-current">{product.name}</span>
        </nav>

        <div className="pdp">
          <div className="pdp-media">
            {product.image ? <img src={product.image} alt={product.name} /> : <div className="pdp-noimg" />}
          </div>

          <div className="pdp-info">
            {product.badge && <div className="pdp-badge">{product.badge}</div>}
            <h1 className="pdp-name">{product.name}</h1>

            <div className="pdp-rating">
              <Stars value={rating.value} size={14} />
              <span className="rc-val">{rating.value.toFixed(1)}</span>
              <a href="#reviews" className="rc-link">{rating.count} reviews</a>
            </div>

            <div className="pdp-price">${product.price.toFixed(2)} <span className="pdp-cur">CAD</span></div>
            {product.fitment && (
              <div className="pdp-fit"><span>Fitment</span> {product.fitment}</div>
            )}
            <p className="pdp-desc">{product.description}</p>

            <ul className="pdp-highlights">
              {highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>

            <AddToCart slug={product.slug} inStock={product.inStock} max={Math.min(20, product.stock)} />

            <TrustRow />

            <div className="pdp-meta">
              <div className={`pdp-stock ${product.inStock ? 'in' : 'out'}`}>
                {product.inStock
                  ? (product.stock <= 8 ? `Only ${product.stock} left in stock` : `In stock — ${product.stock} available`)
                  : 'Currently sold out'}
              </div>
            </div>

            <div className="pdp-acc">
              <details open>
                <summary>Details &amp; specs<span className="faq-icon" aria-hidden="true" /></summary>
                <div className="pdp-acc-body">
                  <dl className="pdp-specs">
                    {specs.map((s) => (
                      <div className="pdp-spec" key={s.label}>
                        <dt>{s.label}</dt>
                        <dd>{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </details>
              <details>
                <summary>Shipping &amp; returns<span className="faq-icon" aria-hidden="true" /></summary>
                <div className="pdp-acc-body">
                  <p>Free shipping on orders over $150, otherwise a flat $9.99. Ships from Vancouver, BC — most Metro orders arrive in 2–3 business days, tracked door to door.</p>
                  <p>Not right for you? Return unused items within 30 days for a full refund. <Link href="/shipping-returns">Full policy →</Link></p>
                </div>
              </details>
            </div>
          </div>
        </div>

        <ProductReviews slug={product.slug} />

        {related.length > 0 && (
          <section className="pdp-related">
            <div className="sec-eyebrow">More from the collection</div>
            <div className="shop-grid">
              {related.map((p) => {
                const r = getRating(p.slug);
                return (
                  <Link key={p.id} href={`/shop/${p.slug}`} className="shop-card">
                    <div className="shop-card-img">
                      {p.image ? <img src={p.image} alt={p.name} /> : <div className="shop-card-noimg" />}
                    </div>
                    <div className="shop-card-body">
                      <div className="shop-card-name">{p.name}</div>
                      <div className="shop-card-rating">
                        <Stars value={r.value} size={11} />
                        <span className="rc-count">{r.value.toFixed(1)} ({r.count})</span>
                      </div>
                      <div className="shop-card-price">${p.price.toFixed(2)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
