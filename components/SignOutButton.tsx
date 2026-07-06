'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handle() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button className="account-signout" onClick={handle}>Sign out</button>
  );
}
