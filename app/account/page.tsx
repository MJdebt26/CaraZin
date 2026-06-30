import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Account · CARAZIN' };

// Protected page. Order history is populated in Phase 4.
export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  return (
    <main style={{ minHeight: '100vh', background: 'var(--off)', padding: '8rem 6vw 4rem', cursor: 'auto' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '.6rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>
        Account
      </div>
      <h1 style={{ fontWeight: 300, fontSize: '2rem', margin: '.6rem 0 .3rem' }}>Your orders</h1>
      <p style={{ color: 'var(--mid)', fontSize: '.85rem' }}>Signed in as {user.email}</p>

      <p style={{ color: 'var(--mid)', fontSize: '.85rem', marginTop: '2.5rem' }}>
        No orders yet.
      </p>

      <Link href="/" style={{
        display: 'inline-block', marginTop: '2.5rem', fontFamily: "'DM Mono', monospace",
        fontSize: '.62rem', letterSpacing: '.2em', textTransform: 'uppercase', color: '#fff',
        background: 'var(--black)', padding: '1rem 2rem', textDecoration: 'none',
      }}>
        ← Back to store
      </Link>
    </main>
  );
}
