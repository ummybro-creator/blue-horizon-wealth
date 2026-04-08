import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: Record<string, any>;
}

interface AuthSession {
  access_token: string;
  user: AuthUser;
}

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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data && !error) setProfile(data as Profile);
  };

  const fetchWallet = async (userId: string) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (data && !error) setWallet(data as Wallet);
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data && !error);
  };

  const refreshProfile = async () => { if (user?.id) await fetchProfile(user.id); };
  const refreshWallet = async () => { if (user?.id) await fetchWallet(user.id); };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, sess: AuthSession | null) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          setTimeout(() => {
            fetchProfile(sess.user.id);
            fetchWallet(sess.user.id);
            checkAdminRole(sess.user.id);
          }, 0);
        } else {
          setProfile(null);
          setWallet(null);
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data }: { data: { session: AuthSession | null } }) => {
      const sess = data?.session;
      setSession(sess ?? null);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchProfile(sess.user.id);
        fetchWallet(sess.user.id);
        checkAdminRole(sess.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (phone: string, password: string, fullName?: string, referralCode?: string) => {
    try {
      const email = `${phone}@app.local`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || '', phone, referral_code: referralCode || '' },
        },
      });
      if (error) return { error: new Error((error as any).message || String(error)) };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (phoneOrEmail: string, password: string) => {
    try {
      // If input contains @, use as-is (admin email); otherwise treat as phone
      const email = phoneOrEmail.includes('@') && !phoneOrEmail.endsWith('@app.local')
        ? phoneOrEmail
        : `${phoneOrEmail.replace('@app.local', '')}@app.local`;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: new Error((error as any).message || String(error)) };

      if ((data as any)?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_blocked')
          .eq('id', (data as any).user.id)
          .maybeSingle();
        if (profileData?.is_blocked) {
          await supabase.auth.signOut();
          return { error: new Error('Your account has been blocked. Please contact support.') };
        }
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setWallet(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, wallet, signUp, signIn, signOut, refreshProfile, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
