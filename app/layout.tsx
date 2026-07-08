import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './store.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carazin.ca';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CARAZIN — Premium Automotive Accessories · Vancouver',
    template: '%s',
  },
  description:
    'OEM-grade lighting, display keys, wireless CarPlay, and exterior upgrades for BMW and Mercedes drivers. Shipped locally from Vancouver, BC — free over $150.',
  keywords: [
    'car accessories Vancouver', 'BMW ambient lighting', 'Mercedes display key',
    'wireless CarPlay', 'M4 CS taillights', 'OEM car upgrades', 'CaraZin',
  ],
  applicationName: 'CARAZIN',
  authors: [{ name: 'Carazin' }],
  openGraph: {
    type: 'website',
    siteName: 'CARAZIN',
    title: 'CARAZIN — Premium Automotive Accessories',
    description:
      'OEM-grade lighting, keys, and exterior for drivers who notice everything. Shipped from Vancouver, BC.',
    url: SITE_URL,
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CARAZIN — Premium Automotive Accessories',
    description: 'OEM-grade car accessories, shipped from Vancouver, BC.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* GSAP loaded globally so the ported init script (window.gsap) works unchanged */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
