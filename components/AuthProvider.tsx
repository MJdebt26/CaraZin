'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type AuthResult = { error: string | null; needsConfirmation?: boolean };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  supabase: SupabaseClient | null;
  authModalOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    // getUser() validates the session against the server (getSession() would
    // trust a possibly-stale local cookie).
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const value: AuthContextValue = {
    user,
    loading,
    configured: !!supabase,
    supabase,
    authModalOpen,
    openAuth: () => setAuthModalOpen(true),
    closeAuth: () => setAuthModalOpen(false),
    async signIn(email, password) {
      if (!supabase) return { error: 'Accounts are not configured yet.' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    async signUp(email, password) {
      if (!supabase) return { error: 'Accounts are not configured yet.' };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      // If email confirmation is enabled, there's no session until the user confirms.
      const needsConfirmation = !data.session;
      return { error: null, needsConfirmation };
    },
    async signOut() {
      await supabase?.auth.signOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
