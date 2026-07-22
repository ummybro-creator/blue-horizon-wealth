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

/* ── Inline SVG icons (flat orange, consistent style) ── */
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={ORANGE} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={ORANGE} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconPhone = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="3" stroke={ORANGE} strokeWidth="2"/>
    <circle cx="12" cy="18" r="1" fill={ORANGE}/>
    <line x1="9" y1="6" x2="15" y2="6" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke={ORANGE} strokeWidth="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={ORANGE} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.2" fill={ORANGE}/>
  </svg>
);

const IconGift = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="10" width="18" height="11" rx="2" stroke={ORANGE} strokeWidth="2"/>
    <path d="M3 10h18v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2Z" stroke={ORANGE} strokeWidth="2"/>
    <path d="M12 4C12 4 9 6 9 8h6c0-2-3-4-3-4Z" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="8" x2="12" y2="21" stroke={ORANGE} strokeWidth="2"/>
  </svg>
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
      height: 60,
      borderRadius: 28,
      background: '#FFFFFF',
      border: '1.5px solid #E8D5C4',
      paddingLeft: 18,
      paddingRight: 16,
      gap: 10,
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
  fontSize: 15,
  fontFamily: FONT,
  color: '#3A2D26',
};

/* ── App icon with double border ── */
const AppIcon = () => (
  <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 16 }}>
    {/* Outer orange border ring */}
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: 28,
      background: 'linear-gradient(135deg, #FF9A2E, #FF6B00)',
      boxShadow: '0 8px 28px rgba(255,106,0,0.35)',
    }} />
    {/* Inner purple border ring */}
    <div style={{
      position: 'absolute', inset: 4,
      borderRadius: 24,
      background: 'linear-gradient(135deg, #B57BFF, #7B3FBF)',
    }} />
    {/* White inner padding */}
    <div style={{
      position: 'absolute', inset: 7,
      borderRadius: 20,
      background: '#fff',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* V/Diamond logo */}
      <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="aLg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFB27A"/>
            <stop offset="60%" stopColor="#FF7A2E"/>
            <stop offset="100%" stopColor="#E24E00"/>
          </linearGradient>
          <linearGradient id="aLg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A3D"/>
            <stop offset="100%" stopColor="#C93F00"/>
          </linearGradient>
        </defs>
        <path d="M10 22 L38 22 L50 50 L28 44 Z" fill="url(#aLg1)"/>
        <path d="M90 22 L62 22 L50 50 L72 44 Z" fill="url(#aLg1)"/>
        <path d="M28 44 L72 44 L50 92 Z" fill="url(#aLg2)"/>
        <path d="M50 50 L50 92 L28 44 Z" fill="#fff" opacity="0.12"/>
      </svg>
    </div>
  </div>
);

/* ── Decorative dot divider ── */
const DotDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 6, marginBottom: 28 }}>
    <div style={{ width: 24, height: 1.5, background: `linear-gradient(to left, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 24, height: 1.5, background: `linear-gradient(to right, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
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
        background: 'linear-gradient(180deg, #FDE8DC 0%, #FFF6EE 100%)',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420, padding: '48px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── App Icon ── */}
        <AppIcon />

        {/* ── App name ── */}
        <h1 style={{
          fontSize: 38,
          fontWeight: 800,
          color: ORANGE_DARK,
          letterSpacing: -0.5,
          lineHeight: 1,
          margin: 0,
          fontFamily: FONT,
        }}>
          Veltrix
        </h1>

        {/* ── Dot divider ── */}
        <DotDivider />

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            background: '#FDF6F0',
            borderRadius: 32,
            padding: '28px 20px 24px',
            border: '1.5px solid #F0DDD0',
            boxShadow: '0 8px 32px rgba(255,120,40,0.10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: '1.5px solid #E8D5C4', marginRight: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#2B2B2B', fontFamily: FONT }}>+91</span>
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
              marginTop: 6,
              width: '100%',
              height: 58,
              borderRadius: 28,
              background: loading
                ? '#CCC'
                : `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`,
              color: '#fff',
              fontWeight: 700,
              fontSize: 17,
              fontFamily: FONT,
              letterSpacing: 1,
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(255,106,0,0.38)',
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
                {!isLogin && <span style={{ fontSize: 18 }}>🚀</span>}
              </>
            )}
          </button>

          {/* ── Secondary / toggle button ── */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 28,
              background: 'transparent',
              border: `1.5px solid ${ORANGE}`,
              color: ORANGE,
              fontSize: 15,
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
                <span style={{ fontWeight: 700 }}>&nbsp;Sign Up</span>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 400 }}>Have an account?</span>
                <span style={{ fontWeight: 700 }}>&nbsp;Login</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;
