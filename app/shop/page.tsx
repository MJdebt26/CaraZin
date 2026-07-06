import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';
import { getProducts } from '@/lib/products-server';

export const metadata = { title: 'Shop · CARAZIN' };

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="shop-main">
        <div className="shop-head">
          <div className="sec-eyebrow">The Collection</div>
          <h1 className="shop-title">Shop all</h1>
          <p className="shop-sub">{products.length} products · precision accessories for the driver who notices everything.</p>
        </div>

        {products.length === 0 ? (
          <p className="shop-empty">No products available. (Is Supabase configured?)</p>
        ) : (
          <div className="shop-grid">
            {products.map((p) => (
              <Link key={p.id} href={`/shop/${p.slug}`} className="shop-card">
                <div className="shop-card-img">
                  {p.image ? <img src={p.image} alt={p.name} /> : <div className="shop-card-noimg" />}
                  {p.badge && <span className="shop-card-badge">{p.badge}</span>}
                  {!p.inStock && <span className="shop-card-sold">Sold out</span>}
                </div>
                <div className="shop-card-body">
                  <div className="shop-card-name">{p.name}</div>
                  {p.fitment && <div className="shop-card-fit">{p.fitment}</div>}
                  <div className="shop-card-price">${p.price.toFixed(2)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
