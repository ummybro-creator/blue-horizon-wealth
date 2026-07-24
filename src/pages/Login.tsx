import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema    = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

/* ── Design tokens (PRD §4 / §11) ──────────────────────────────────── */
const ORANGE       = '#F5821F';   // brand primary
const ORANGE_DEEP  = '#E8600F';   // "Login" bold accent
const ICON_BG      = '#FBDCC4';   // icon badge background (peach)
const ICON_GLYPH   = '#E8752C';   // icon glyph color
const INPUT_BORDER = '#E4D9CE';
const CARD_BG      = '#FBF6F0';
const PLACEHOLDER  = '#A8A8A8';
const FONT         = "'Poppins', sans-serif";

/* ── Icon badges (44×44 dp circle, peach bg, orange glyphs) ─────────── */
const IconUser = () => (
  <div style={{
    width: 44, height: 44, borderRadius: '50%',
    background: ICON_BG,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7.5" r="4" fill={ICON_GLYPH}/>
      <path d="M3.5 20.5c0-4.14 3.8-7.5 8.5-7.5s8.5 3.36 8.5 7.5" stroke={ICON_GLYPH} strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  </div>
);

const IconPhone = () => (
  <div style={{
    width: 44, height: 44, borderRadius: '50%',
    background: ICON_BG,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {/* Retro telephone handset */}
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
        fill={ICON_GLYPH}
      />
    </svg>
  </div>
);

const IconLock = () => (
  <div style={{
    width: 44, height: 44, borderRadius: '50%',
    background: ICON_BG,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2.5" fill={ICON_GLYPH}/>
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke={ICON_GLYPH} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="16" r="1.4" fill="#fff"/>
    </svg>
  </div>
);

const IconReferral = () => (
  <div style={{
    width: 44, height: 44, borderRadius: '50%',
    background: ICON_BG,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {/* Network / referral icon — 3 connected circles */}
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2.5" fill={ICON_GLYPH}/>
      <circle cx="5"  cy="19" r="2.5" fill={ICON_GLYPH}/>
      <circle cx="19" cy="19" r="2.5" fill={ICON_GLYPH}/>
      <line x1="12" y1="7.5" x2="5.8"  y2="16.5" stroke={ICON_GLYPH} strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="12" y1="7.5" x2="18.2" y2="16.5" stroke={ICON_GLYPH} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  </div>
);

/* ── Input field wrapper ─────────────────────────────────────────────── */
interface PillFieldProps {
  icon: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}
const PillField = ({ icon, left, right, children }: PillFieldProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    height: 64,
    borderRadius: 20,           /* PRD §6.4: ~20dp */
    background: '#FFFFFF',
    border: `1px solid ${INPUT_BORDER}`,
    paddingLeft: 12,
    paddingRight: 14,
    gap: 10,
    width: '100%',
    boxSizing: 'border-box',
  }}>
    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
    {left}
    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>{children}</div>
    {right && (
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{right}</span>
    )}
  </div>
);

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 17,
  fontFamily: FONT,
  color: '#3D2C22',
};

/* ── App icon with purple gradient ring ─────────────────────────────── */
const AppIcon = () => (
  <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 18 }}>
    {/* Outer orange glow ring */}
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: 36,
      background: 'linear-gradient(135deg, #FF9A2E, #FF6B00)',
      boxShadow: '0 12px 32px rgba(255,106,0,0.35)',
    }}/>
    {/* Purple gradient ring */}
    <div style={{
      position: 'absolute', inset: 5,
      borderRadius: 31,
      background: 'linear-gradient(135deg, #B98BFA, #7B2FF7)',
    }}/>
    {/* White inner pad */}
    <div style={{
      position: 'absolute', inset: 10,
      borderRadius: 24,
      background: '#fff',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="92" height="92" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="swirl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#E4C7FF"/>
            <stop offset="55%"  stopColor="#C393FF"/>
            <stop offset="100%" stopColor="#8A4FDB"/>
          </linearGradient>
          <linearGradient id="cupG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFFFFF"/>
            <stop offset="100%" stopColor="#F1E6DC"/>
          </linearGradient>
        </defs>
        {/* cup */}
        <path d="M30 62 L70 62 L64 90 Q50 95 36 90 Z" fill="url(#cupG)" stroke="#DDD0C2" strokeWidth="1"/>
        {/* scoops */}
        <circle cx="50" cy="54" r="17" fill="url(#swirl)"/>
        <circle cx="38" cy="46" r="13" fill="url(#swirl)"/>
        <circle cx="62" cy="46" r="13" fill="url(#swirl)"/>
        <circle cx="50" cy="36" r="12" fill="url(#swirl)"/>
        {/* drizzle */}
        <path d="M40 40 Q50 47 60 40" stroke="#6B2FB3" strokeWidth="2.2" strokeLinecap="round" opacity="0.45"/>
        {/* sprinkles */}
        <circle cx="44" cy="33" r="1.8" fill="#FFD166"/>
        <circle cx="57" cy="38" r="1.8" fill="#FF6B6B"/>
        <circle cx="50" cy="27" r="1.8" fill="#4CD4B0"/>
        <circle cx="62" cy="33" r="1.4" fill="#FFD166"/>
      </svg>
    </div>
  </div>
);

/* ── Decorative dot-line divider ─────────────────────────────────────── */
const DotDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 28 }}>
    <div style={{ width: 32, height: 1.5, background: `linear-gradient(to left, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 32, height: 1.5, background: `linear-gradient(to right, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
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
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(180deg, #FCE8DC 0%, #FDF2EA 100%)',
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowX: 'hidden',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '52px 20px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* App icon */}
        <AppIcon />

        {/* Brand wordmark */}
        <h1 style={{
          fontSize: 38,
          fontWeight: 800,
          color: ORANGE,
          letterSpacing: -0.5,
          lineHeight: 1,
          margin: 0,
          fontFamily: FONT,
        }}>
          Havmor
        </h1>

        {/* Decorative divider */}
        <DotDivider />

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            background: CARD_BG,
            borderRadius: 32,
            padding: '28px 22px 24px',
            border: '1px solid #EDE0D4',
            boxShadow: '0 16px 40px rgba(200,120,60,0.10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >

          {/* Nickname (register only) */}
          {!isLogin && (
            <PillField icon={<IconUser />}>
              <input
                style={{ ...inputStyle }}
                type="text"
                placeholder="Nickname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </PillField>
          )}

          {/* Phone Number */}
          <PillField
            icon={<IconPhone />}
            left={
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                paddingRight: 10, borderRight: `1.5px solid ${INPUT_BORDER}`,
                marginRight: 2, flexShrink: 0,
              }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#2B2B2B', fontFamily: FONT }}>+91</span>
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
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPassword
                  ? <Eye    width={20} height={20} color={ICON_GLYPH} />
                  : <EyeOff width={20} height={20} color={ICON_GLYPH} />}
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

          {/* Referral code (register only) */}
          {!isLogin && (
            <PillField icon={<IconReferral />}>
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

          {/* ── Primary CTA ── */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              width: '100%',
              height: 60,
              borderRadius: 18,
              background: loading
                ? '#D4C0B4'
                : 'linear-gradient(180deg, #F7931E 0%, #F5821F 50%, #F5641E 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              fontFamily: FONT,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 28px rgba(245,100,30,0.40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s, transform 0.1s',
              opacity: loading ? 0.75 : 1,
            }}
            onMouseDown={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'scale(0.985)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {loading ? 'Please wait…' : (
              <>
                {isLogin ? 'Login' : 'Register Now'}
                {!isLogin && <span style={{ fontSize: 20 }}>🚀</span>}
              </>
            )}
          </button>

          {/* ── Secondary / toggle ── */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 18,
              background: 'transparent',
              border: `1.5px solid ${ORANGE}`,
              fontSize: 15.5,
              fontFamily: FONT,
              fontWeight: 400,
              color: ORANGE,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {isLogin ? (
              <>
                <span>Don't have an account?</span>
                <span style={{ fontWeight: 700, color: ORANGE_DEEP }}>&nbsp;Sign Up</span>
              </>
            ) : (
              <>
                <span>Have an account?</span>
                <span style={{ fontWeight: 700, color: ORANGE_DEEP }}>&nbsp;Login</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

/* Inject placeholder colour via a global style tag so we don't need extra deps */
const PlaceholderStyle = () => (
  <style>{`
    input::placeholder { color: ${PLACEHOLDER}; opacity: 1; }
  `}</style>
);

const LoginWithStyle = () => (
  <>
    <PlaceholderStyle />
    <Login />
  </>
);

export default LoginWithStyle;
