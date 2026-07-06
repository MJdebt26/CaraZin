import type { PublicProduct } from '@/lib/cart';

// Derives presentation-only spec sheets and highlights from the catalogue fields
// so every PDP reads like a real product page without extra DB columns.

const CATEGORY_LABEL: Record<string, string> = {
  lighting: 'Interior & Ambient Lighting',
  electronics: 'Electronics & Detection',
  connectivity: 'Connectivity',
  keys: 'Smart Keys',
  exterior: 'Exterior & Lighting',
};

const CATEGORY_INSTALL: Record<string, string> = {
  lighting: 'Plug-and-play · ~20–30 min · no cutting',
  electronics: 'Hardwire or 12V · ~15 min',
  connectivity: 'Plug into OEM port · pairs in minutes',
  keys: 'Pair to vehicle · ~10 min',
  exterior: 'Direct OEM replacement · plug-and-play harness',
};

const CATEGORY_BOX: Record<string, string> = {
  lighting: 'Light kit, adhesive mounts, control module, illustrated guide',
  electronics: 'Unit, power lead, mount, quick-start card',
  connectivity: 'Adapter, USB lead, quick-start card',
  keys: 'Display key, charging cable, quick-start card',
  exterior: 'Left + right assembly, plug-and-play harness, hardware',
};

function warrantyMonths(category: string): number {
  return category === 'lighting' || category === 'exterior' ? 24 : 12;
}

export function getSpecs(p: PublicProduct): { label: string; value: string }[] {
  return [
    { label: 'Fitment', value: p.fitment || 'Universal' },
    { label: 'Category', value: CATEGORY_LABEL[p.category] || p.category },
    { label: 'Installation', value: CATEGORY_INSTALL[p.category] || 'Plug-and-play' },
    { label: 'In the box', value: CATEGORY_BOX[p.category] || 'Product, hardware, install guide' },
    { label: 'Warranty', value: `${warrantyMonths(p.category)}-month coverage` },
    { label: 'Ships from', value: 'Vancouver, BC · tracked' },
  ];
}

export function getHighlights(p: PublicProduct): string[] {
  const base = [
    'OEM-grade fit and finish — tested on our own cars before it ships',
    p.fitment ? `Engineered for ${p.fitment}` : 'Universal fitment',
  ];
  const byCat: Record<string, string> = {
    lighting: 'Even, flicker-free colour with in-app / OEM control',
    electronics: 'Long-range detection with minimal false alerts',
    connectivity: 'Wireless once paired — auto-connects every drive',
    keys: 'Full-colour display with lock, unlock, and status at a glance',
    exterior: 'Sequential animation and a concours-level finish',
  };
  base.push(byCat[p.category] || 'A detail that makes the whole car read more expensive');
  base.push(`${warrantyMonths(p.category)}-month warranty · 30-day returns`);
  return base;
}
