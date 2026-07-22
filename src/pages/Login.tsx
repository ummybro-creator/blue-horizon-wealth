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
const HEADING_FONT = "'Baloo 2', 'Poppins', sans-serif";
const LOGO_URL     = 'https://files.catbox.moe/wax8r6.jpg';

/* ── Inline SVG icons (flat orange, consistent style) ── */
const IconUser = () => (
  <div style={{
    width: 30, height: 30, borderRadius: '50%',
    background: '#FFE1C7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill={ORANGE}>
      <circle cx="12" cy="8" r="4.2"/>
      <path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5" />
    </svg>
  </div>
);

const IconPhone = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="1.5" width="16" height="21" rx="3.2" fill={ORANGE}/>
    <rect x="6.3" y="4" width="11.4" height="13.2" rx="1" fill="#FFF3E8"/>
    <circle cx="12" cy="19.2" r="1.3" fill="#FFF3E8"/>
  </svg>
);

const IconLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4.5" y="10.5" width="15" height="11" rx="2.5" fill={ORANGE}/>
    <path d="M7.5 10.5V7.2a4.5 4.5 0 0 1 9 0v3.3" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M9.7 15.2l1.4 1.5 3.2-3.3" stroke="#FFF3E8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IconGift = () => (
  <div style={{
    width: 30, height: 30, borderRadius: '50%',
    border: `1.5px dashed ${ORANGE}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="18" height="10" rx="1.5" fill={ORANGE}/>
      <rect x="3" y="7" width="18" height="4" rx="1" fill={ORANGE}/>
      <path d="M12 7C12 7 8.8 5 8.8 2.8A2.2 2.2 0 0 1 12 2.5C15.2 2.5 12 7 12 7Z" fill={ORANGE}/>
      <path d="M12 7C12 7 15.2 5 15.2 2.8A2.2 2.2 0 0 0 12 2.5C8.8 2.5 12 7 12 7Z" fill={ORANGE}/>
      <rect x="10.8" y="7" width="2.4" height="13" fill="#FFF3E8"/>
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
      height: 68,
      borderRadius: 24,
      background: '#FFFFFF',
      border: '1.5px solid #EBDCCF',
      paddingLeft: 20,
      paddingRight: 20,
      gap: 14,
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
  fontSize: 17,
  fontFamily: FONT,
  color: '#3A2D26',
};

/* ── App icon — new Havmor logo image ── */
const AppIcon = () => (
  <div style={{
    width: 148,
    height: 148,
    marginBottom: 18,
    borderRadius: 32,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(255,106,0,0.30)',
    background: '#fff',
  }}>
    <img
      src={LOGO_URL}
      alt="Havmor logo"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  </div>
);

/* ── Decorative dot divider ── */
const DotDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 32 }}>
    <div style={{ width: 30, height: 1.5, background: `linear-gradient(to left, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 5, height: 5, borderRadius: '50%', background: ORANGE }}/>
    <div style={{ width: 30, height: 1.5, background: `linear-gradient(to right, ${ORANGE}, transparent)`, borderRadius: 2 }}/>
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
        background: 'linear-gradient(180deg, #FDE3D3 0%, #FFF7F0 45%)',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420, padding: '56px 20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* ── App Icon ── */}
        <AppIcon />

        {/* ── App name ── */}
        <h1 style={{
          fontSize: 44,
          fontWeight: 800,
          color: ORANGE_DARK,
          letterSpacing: -0.5,
          lineHeight: 1,
          margin: 0,
          fontFamily: HEADING_FONT,
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
            background: '#FDF6F0',
            borderRadius: 34,
            padding: '32px 22px 26px',
            border: '1.5px solid #F0DDD0',
            boxShadow: '0 10px 36px rgba(255,120,40,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12, borderRight: '1.5px solid #EBDCCF', marginRight: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#2B2B2B', fontFamily: FONT }}>+91</span>
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
                  ? <Eye width={22} height={22} color={ORANGE} />
                  : <EyeOff width={22} height={22} color={ORANGE} />}
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
              height: 64,
              borderRadius: 24,
              background: loading
                ? '#CCC'
                : `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`,
              color: '#fff',
              fontWeight: 700,
              fontSize: 19,
              fontFamily: FONT,
              letterSpacing: 1,
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 26px rgba(255,106,0,0.40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : (
              <>
                {isLogin ? 'Login' : 'Register Now'}
                {!isLogin && <span style={{ fontSize: 20 }}>🚀</span>}
              </>
            )}
          </button>

          {/* ── Secondary / toggle button ── */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              width: '100%',
              height: 58,
              borderRadius: 24,
              background: 'transparent',
              border: `1.5px solid ${ORANGE}`,
              color: ORANGE,
              fontSize: 16,
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
