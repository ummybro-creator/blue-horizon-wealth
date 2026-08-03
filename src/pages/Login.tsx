import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
const coverAsset = { url: '/brand/auth-cover.jpg' };
const logoAsset = { url: '/brand/coolio-logo.png' };

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

/* ── Reference design tokens ─────────────────────────────── */
const ORANGE = '#F07222';
const ORANGE_DEEP = '#E2611A';
const FIELD_BG = '#FDF6F1';
const FIELD_BORDER = '#F5E3D6';
const PLACEHOLDER = '#A9A9A9';
const MUTED = '#9B9B9B';
const FONT = "'Poppins', sans-serif";

const fieldWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 58,
  borderRadius: 999,
  background: FIELD_BG,
  border: `1px solid ${FIELD_BORDER}`,
  padding: '0 22px',
  gap: 12,
  width: '100%',
  boxSizing: 'border-box',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 15.5,
  fontFamily: FONT,
  fontWeight: 400,
  color: '#2B2B2B',
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const lockedRef = new URLSearchParams(location.search).get('ref');

  useEffect(() => {
    const ref = new URLSearchParams(location.search).get('ref');
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
        if (error) { toast.error('Invalid mobile number or password'); return; }
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
      background: '#FFFFFF',
      fontFamily: FONT,
      overflowX: 'hidden',
    }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', position: 'relative' }}>

        {/* ── Hero cover banner ── */}
        <div style={{ width: '100%', height: 268, overflow: 'hidden', background: ORANGE }}>
          <img
            src={coverAsset.url}
            alt="Coolio Ice Cream cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* ── White sheet ── */}
        <div style={{
          position: 'relative',
          marginTop: -34,
          background: '#FFFFFF',
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
          padding: '0 24px 40px',
          minHeight: 'calc(100vh - 234px)',
          boxSizing: 'border-box',
        }}>

          {/* Circular logo badge overlapping the sheet */}
          <div style={{
            position: 'absolute',
            top: -62,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 124,
            height: 124,
            borderRadius: '50%',
            background: '#FFFFFF',
            padding: 7,
            boxSizing: 'border-box',
            boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
          }}>
            <img
              src={logoAsset.url}
              alt="Coolio Ice Cream logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
            />
          </div>

          {/* ── Tabs ── */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 56,
            paddingTop: 78,
            marginBottom: 34,
          }}>
            {[{ label: 'Login', active: isLogin }, { label: 'Register', active: !isLogin }].map(t => (
              <button
                key={t.label}
                type="button"
                onClick={() => setIsLogin(t.label === 'Login')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 2px 9px',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  fontSize: 21,
                  fontWeight: t.active ? 700 : 500,
                  color: t.active ? ORANGE : '#A5A5A5',
                  borderBottom: t.active ? `4px solid ${ORANGE}` : '4px solid transparent',
                  borderRadius: 2,
                  transition: 'color .2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {!isLogin && (
              <div style={fieldWrap}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Enter nickname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {/* Mobile */}
            <div style={fieldWrap}>
              <span style={{ fontSize: 17, fontWeight: 700, color: ORANGE, fontFamily: FONT }}>+91</span>
              <span style={{ width: 1, height: 26, background: '#EBD9CB', flexShrink: 0 }} />
              <input
                style={inputStyle}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>

            {/* Password */}
            <div style={fieldWrap}>
              <input
                style={inputStyle}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
              >
                {showPassword
                  ? <EyeOff width={22} height={22} color={ORANGE} />
                  : <Eye width={22} height={22} color={ORANGE} />}
              </button>
            </div>

            {!isLogin && (
              <div style={fieldWrap}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Enter refer code (optional)"
                  value={referralCode}
                  readOnly={!!lockedRef}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
            )}

            {/* Remember / Forgot */}
            {isLogin && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 4px 4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <span
                    onClick={() => setRemember(!remember)}
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: `2px solid ${ORANGE}`,
                      background: remember ? ORANGE : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {remember && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M4 12.5l5 5L20 6.5" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#2B2B2B', fontFamily: FONT }}>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Please contact support to reset your password')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT, fontSize: 15, fontWeight: 600, color: ORANGE }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 14,
                width: '100%',
                height: 62,
                borderRadius: 999,
                border: 'none',
                background: loading ? '#E5C7B2' : `linear-gradient(180deg, #F5852F 0%, ${ORANGE} 55%, ${ORANGE_DEEP} 100%)`,
                color: '#FFFFFF',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: 1.4,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 22px rgba(240,114,34,0.35)',
              }}
            >
              {loading ? 'PLEASE WAIT…' : (isLogin ? 'LOGIN' : 'REGISTER')}
            </button>

            {/* Footer switch */}
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 15.5, color: MUTED, fontFamily: FONT }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT, fontSize: 15.5, fontWeight: 700, color: ORANGE }}
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`input::placeholder { color: ${PLACEHOLDER}; opacity: 1; }`}</style>
    </div>
  );
};

export default Login;
