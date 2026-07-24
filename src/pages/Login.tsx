import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema    = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const ORANGE      = '#FF7A1A';
const ORANGE_DARK = '#FF6B00';
const FONT        = "'Poppins', sans-serif";

/* ── Inline SVG icons (flat orange, consistent style — matches reference) ── */
const IconUser = () => (
  <div style={{
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(160deg, #FFD9B8, #FFC08A)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="#fff" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#fff" />
    </svg>
  </div>
);

const IconPhone = () => (
  <div style={{
    width: 34, height: 34, borderRadius: 10,
    background: `linear-gradient(160deg, ${ORANGE}, ${ORANGE_DARK})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="10" rx="2" stroke="#fff" strokeWidth="1.6"/>
      <circle cx="12" cy="10" r="2.2" stroke="#fff" strokeWidth="1.4"/>
      <path d="M8 18h8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M12 15v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  </div>
);

const IconLock = () => (
  <div style={{
    width: 34, height: 34, borderRadius: 10,
    background: 'linear-gradient(160deg, #FF8A5C, #E5391F)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.85)' }} />
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="#fff"/>
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="15.5" r="1.3" fill="#E5391F"/>
    </svg>
  </div>
);

const IconGift = () => (
  <div style={{
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(160deg, #FFD9B8, #FFC08A)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="1.6"/>
      <ellipse cx="12" cy="12" rx="3.2" ry="8" stroke="#fff" strokeWidth="1.4"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="#fff" strokeWidth="1.4"/>
    </svg>
  </div>
);

/* ── Pill input field ── */
interface PillFieldProps {
  icon: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}
const PillField = ({ icon, left, right, children }: PillFieldProps) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: 64,
      borderRadius: 32,
      background: '#FFFFFF',
      border: '1.5px solid #ECD9C9',
      paddingLeft: 14,
      paddingRight: 18,
      gap: 12,
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
    {left}
    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{children}</div>
    {right}
  </div>
);

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 16,
  fontFamily: FONT,
  color: '#6B5A4E',
};

/* ── App icon with double border (orange outer, purple inner) ── */
const AppIcon = () => (
  <div style={{ position: 'relative', width: 132, height: 132, marginBottom: 20 }}>
    {/* Outer orange border ring */}
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: 34,
      background: 'linear-gradient(135deg, #FF9A2E, #FF6B00)',
      boxShadow: '0 10px 30px rgba(255,106,0,0.38)',
    }} />
    {/* Inner purple border ring */}
    <div style={{
      position: 'absolute', inset: 6,
      borderRadius: 28,
      background: 'linear-gradient(135deg, #C393FF, #8A4FDB)',
    }} />
    {/* White inner padding */}
    <div style={{
      position: 'absolute', inset: 10,
      borderRadius: 22,
      background: '#fff',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Soft-serve ice cream cup illustration */}
      <svg width="88" height="88" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="swirl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E4C7FF"/>
            <stop offset="55%" stopColor="#C393FF"/>
            <stop offset="100%" stopColor="#8A4FDB"/>
          </linearGradient>
          <linearGradient id="cupG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF"/>
            <stop offset="100%" stopColor="#F1E6DC"/>
          </linearGradient>
        </defs>
        {/* cup */}
        <path d="M30 62 L70 62 L64 90 Q50 94 36 90 Z" fill="url(#cupG)" stroke="#E0CDBB" strokeWidth="1"/>
        {/* swirl scoops */}
        <circle cx="50" cy="55" r="17" fill="url(#swirl)"/>
        <circle cx="38" cy="47" r="13" fill="url(#swirl)"/>
        <circle cx="62" cy="47" r="13" fill="url(#swirl)"/>
        <circle cx="50" cy="36" r="12" fill="url(#swirl)"/>
        {/* drizzle */}
        <path d="M40 40 Q50 46 60 40" stroke="#6B2FB3" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        {/* sprinkles */}
        <circle cx="44" cy="34" r="1.6" fill="#FFD166"/>
        <circle cx="56" cy="38" r="1.6" fill="#FF6B6B"/>
        <circle cx="50" cy="28" r="1.6" fill="#4CD4B0"/>
      </svg>
    </div>
  </div>
);

/* ── Decorative dot divider ── */
const DotDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 32 }}>
    <div style={{ width: 28, height: 1.5, background: `linear-gradient(to left, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 28, height: 1.5, background: `linear-gradient(to right, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
  </div>
);

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { signIn, signUp, user } = useAuth();

  const [isLogin, setIsLogin]           = useState(false);
  const [mobile, setMobile]             = useState('');
  const [password, setPassword]         = useState('');
  const [fullName, setFullName]         = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const lockedRef = new URLSearchParams(location.search).get('ref');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) { setIsLogin(false); setReferralCode(ref); }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      phoneSchema.parse(mobile);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Invalid input');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(mobile, password);
        if (error) { toast.error('Invalid phone number or password'); return; }
        toast.success('Login successful!');
        navigate('/', { replace: true });
      } else {
        const { error } = await signUp(mobile, password, fullName, referralCode);
        if (error) { toast.error(error.message || 'Registration failed'); return; }
        toast.success('Account created!');
        navigate('/', { replace: true });
      }
    } finally { setLoading(false); }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(180deg, #FBDCC7 0%, #FFF7F0 45%)',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420, padding: '52px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── App Icon ── */}
        <AppIcon />

        {/* ── App name ── */}
        <h1 style={{
          fontSize: 40,
          fontWeight: 800,
          color: ORANGE_DARK,
          letterSpacing: -0.5,
          lineHeight: 1,
          margin: 0,
          fontFamily: FONT,
        }}>
          Havmor
        </h1>

        {/* ── Dot divider ── */}
        <DotDivider />

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            background: '#FDF5EE',
            borderRadius: 36,
            padding: '30px 20px 24px',
            border: '1.5px solid #F2E0D2',
            boxShadow: '0 12px 36px rgba(255,120,40,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >

          {/* ── Register fields ── */}
          {!isLogin && (
            /* Nickname */
            <PillField icon={<IconUser />}>
              <input
                style={inputStyle}
                type="text"
                placeholder="Nickname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </PillField>
          )}

          {/* Phone */}
          <PillField
            icon={<IconPhone />}
            left={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: '1.5px solid #ECD9C9', marginRight: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#2B2B2B', fontFamily: FONT }}>+91</span>
              </div>
            }
          >
            <input
              style={inputStyle}
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
            />
          </PillField>

          {/* Password */}
          <PillField
            icon={<IconLock />}
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, color: ORANGE, display: 'flex', alignItems: 'center' }}
              >
                {showPassword
                  ? <Eye width={20} height={20} color={ORANGE} />
                  : <EyeOff width={20} height={20} color={ORANGE} />}
              </button>
            }
          >
            <input
              style={inputStyle}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </PillField>

          {/* Refer code (register only) */}
          {!isLogin && (
            <PillField icon={<IconGift />}>
              <input
                style={inputStyle}
                type="text"
                placeholder="Enter refer code"
                value={referralCode}
                readOnly={!!lockedRef}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </PillField>
          )}

          {/* ── Primary button ── */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: '100%',
              height: 62,
              borderRadius: 31,
              background: loading
                ? '#CCC'
                : `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`,
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              fontFamily: FONT,
              letterSpacing: 1,
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 26px rgba(255,106,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : (
              <>
                {isLogin ? 'Login' : 'Register Now'}
                {!isLogin && <span style={{ fontSize: 19 }}>🚀</span>}
              </>
            )}
          </button>

          {/* ── Secondary / toggle button ── */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 28,
              background: 'transparent',
              border: `1.5px solid ${ORANGE}`,
              color: ORANGE,
              fontSize: 15.5,
              fontFamily: FONT,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {isLogin ? (
              <>
                <span style={{ fontWeight: 400 }}>Don't have an account?</span>
                <span style={{ fontWeight: 700, color: ORANGE_DARK }}>&nbsp;Sign Up</span>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 400 }}>Have an account?</span>
                <span style={{ fontWeight: 700, color: ORANGE_DARK }}>&nbsp;Login</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;
