import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthUser = User;
type AuthSession = Session;

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAdmin: boolean;
  profile: Profile | null;
  wallet: Wallet | null;
  signUp: (phone: string, password: string, fullName?: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (phoneOrEmail: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

interface Profile {
  id: string;
  phone_number: string;
  full_name: string | null;
  is_blocked: boolean;
  created_at: string;
  referral_code: string | null;
}

interface Wallet {
  id: string;
  user_id: string;
  total_balance: number;
  recharge_balance: number;
  bonus_balance: number;
  total_income: number;
  withdrawable_balance: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) setProfile(data as Profile);
  }, []);

  const fetchWallet = useCallback(async (userId: string) => {
    const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
    if (data) setWallet(data as Wallet);
  }, []);

  const fetchAdminRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      setIsAdmin(false);
      return false;
    }

    const admin = (data || []).some((row: any) => String(row.role).includes('admin'));
    setIsAdmin(admin);
    return admin;
  }, []);

  const refreshProfile = async () => { if (user?.id) await fetchProfile(user.id); };
  const refreshWallet  = async () => { if (user?.id) await fetchWallet(user.id); };

  // Apply a session object to local state — everything in one synchronous pass
  const applySession = useCallback(async (sess: AuthSession | null) => {
    setLoading(true);
    setSession(sess);
    setUser(sess?.user ?? null);
    if (sess?.user) {
      setIsAdmin(false);
      await Promise.allSettled([
        fetchAdminRole(sess.user.id),
        fetchProfile(sess.user.id),
        fetchWallet(sess.user.id),
      ]);
      setLoading(false);
    } else {
      setIsAdmin(false);
      setProfile(null);
      setWallet(null);
      setLoading(false);
    }
  }, [fetchAdminRole, fetchProfile, fetchWallet]);

  useEffect(() => {
    localStorage.removeItem('veltrix_auth_token');

    // Listen for future auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      void applySession(sess);
    });

    // Restore existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      void applySession(data?.session ?? null);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const signUp = async (phone: string, password: string, fullName?: string, referralCode?: string) => {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const email = `${cleanPhone}@app.local`;
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName || '', phone: cleanPhone, referral_code: referralCode || '' } },
      });
      if (error) return { error: new Error((error as any).message || String(error)) };
      return { error: null };
    } catch (err) { return { error: err as Error }; }
  };

  const signIn = async (phoneOrEmail: string, password: string) => {
    try {
      // Admin uses a real email; regular users provide a phone number → phone@app.local
      const cleanLogin = phoneOrEmail.trim().replace(/\D/g, '');
      const email = phoneOrEmail.includes('@') && !phoneOrEmail.endsWith('@app.local')
        ? phoneOrEmail
        : `${cleanLogin || phoneOrEmail.replace('@app.local', '')}@app.local`;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: new Error((error as any).message || String(error)) };

      // Block check
      const userId = (data as any)?.user?.id;
      if (userId) {
        const { data: prof } = await supabase.from('profiles').select('is_blocked').eq('id', userId).maybeSingle();
        if (prof?.is_blocked) {
          await supabase.auth.signOut();
          return { error: new Error('Your account has been blocked. Please contact support.') };
        }
      }
      return { error: null };
    } catch (err) { return { error: err as Error }; }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setProfile(null); setWallet(null); setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, wallet, signUp, signIn, signOut, refreshProfile, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
