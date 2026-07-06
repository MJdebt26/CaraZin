import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import AnnouncementBar from '@/components/AnnouncementBar';
import ShopBrowser, { type ShopItem } from '@/components/ShopBrowser';
import { getProducts } from '@/lib/products-server';
import { getRating } from '@/lib/reviews';

export const metadata = { title: 'Shop · CARAZIN' };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const products = await getProducts();
  const items: ShopItem[] = products.map((p) => ({ ...p, rating: getRating(p.slug) }));

  return (
    <div className="site-page">
      <AnnouncementBar />
      <SiteHeader />
      <main className="shop-main">
        <div className="shop-head">
          <div className="sec-eyebrow">The Collection</div>
          <h1 className="shop-title">Shop all</h1>
          <p className="shop-sub">Precision accessories for the driver who notices everything — installed on our own cars before they reach you.</p>
        </div>

        {items.length === 0 ? (
          <p className="shop-empty">No products available. (Is Supabase configured?)</p>
        ) : (
          <ShopBrowser products={items} initialCat={cat} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
