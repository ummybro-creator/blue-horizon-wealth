import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const APP_NAME = 'Veltrix';
const LOGO_URL = 'https://files.catbox.moe/czrznu.jpg';

/* ── Farmer Bazar Logo SVG (tractor + wheat badge) ── */
const FarmerLogo = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="40" cy="40" r="38" fill="url(#bgGrad)" />
    {/* Outer leaf ring left */}
    <ellipse cx="14" cy="38" rx="5" ry="12" fill="#66BB6A" opacity="0.7" transform="rotate(-35 14 38)" />
    <ellipse cx="11" cy="44" rx="4" ry="10" fill="#4CAF50" opacity="0.8" transform="rotate(-50 11 44)" />
    {/* Outer leaf ring right */}
    <ellipse cx="66" cy="38" rx="5" ry="12" fill="#66BB6A" opacity="0.7" transform="rotate(35 66 38)" />
    <ellipse cx="69" cy="44" rx="4" ry="10" fill="#4CAF50" opacity="0.8" transform="rotate(50 69 44)" />
    {/* Top wheat stalks */}
    <path d="M28 28 Q27 20 30 16" stroke="#8BC34A" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="30" cy="15" rx="3" ry="5" fill="#8BC34A" transform="rotate(-10 30 15)"/>
    <path d="M40 24 Q40 16 40 12" stroke="#8BC34A" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="40" cy="11" rx="3" ry="5" fill="#8BC34A"/>
    <path d="M52 28 Q53 20 50 16" stroke="#8BC34A" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="50" cy="15" rx="3" ry="5" fill="#8BC34A" transform="rotate(10 50 15)"/>
    {/* Tractor body */}
    <rect x="28" y="42" width="28" height="14" rx="3" fill="#2E7D32"/>
    <rect x="28" y="38" width="16" height="8" rx="2" fill="#388E3C"/>
    {/* Tractor cab window */}
    <rect x="30" y="39.5" width="12" height="5" rx="1.5" fill="#B3E5FC"/>
    {/* Exhaust pipe */}
    <rect x="42" y="34" width="3" height="8" rx="1.5" fill="#1B5E20"/>
    <circle cx="43.5" cy="33" r="2.5" fill="#1B5E20"/>
    {/* Front bumper */}
    <rect x="54" y="46" width="5" height="7" rx="1.5" fill="#1B5E20"/>
    {/* Big rear wheel */}
    <circle cx="32" cy="57" r="8" fill="#1B5E20" stroke="#4CAF50" strokeWidth="1.5"/>
    <circle cx="32" cy="57" r="4" fill="#2E7D32"/>
    <circle cx="32" cy="57" r="1.5" fill="#81C784"/>
    {/* Small front wheel */}
    <circle cx="56" cy="57" r="5" fill="#1B5E20" stroke="#4CAF50" strokeWidth="1.5"/>
    <circle cx="56" cy="57" r="2" fill="#2E7D32"/>
    {/* Ground line */}
    <path d="M18 64 Q40 66 62 64" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    {/* Banner ribbon */}
    <path d="M20 70 L22 67 L60 67 L62 70 L60 73 L22 73 Z" fill="#1B5E20"/>
    <path d="M20 70 L23 68 L22 70 L23 72 Z" fill="#4CAF50"/>
    <path d="M62 70 L59 68 L60 70 L59 72 Z" fill="#4CAF50"/>
    <text x="41" y="71.5" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold" fontFamily="Arial">FARMER</text>
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#E8F5E9"/>
        <stop offset="100%" stopColor="#C8E6C9"/>
      </radialGradient>
    </defs>
  </svg>
);

/* ── Input icon components ── */
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill="#BDBDBD"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="3" fill="#4FC3F7"/>
    <rect x="8" y="5" width="8" height="11" rx="1" fill="#fff"/>
    <circle cx="12" cy="19" r="1" fill="#fff"/>
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2.5" fill="#4FC3F7"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.5" fill="#fff"/>
  </svg>
);

const IconEye = ({ off }: { off?: boolean }) =>
  off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#BDBDBD" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="#BDBDBD" strokeWidth="2"/>
    </svg>
  );

const IconReferral = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="2.5" fill="#4FC3F7"/>
    <circle cx="4.5" cy="18" r="2.5" fill="#4FC3F7"/>
    <circle cx="19.5" cy="18" r="2.5" fill="#4FC3F7"/>
    <path d="M12 7.5v4M12 11.5l-7.5 4.5M12 11.5l7.5 4.5" stroke="#4FC3F7" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── Main component ── */
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
  const [loading, setLoading] = useState(false);

  const lockedRef = new URLSearchParams(location.search).get('ref');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) { setIsLogin(false); setReferralCode(ref); }
  }, [location.search]);

  // Redirect whenever user state becomes non-null — covers the async gap between
  // signIn() returning and React committing the setUser() state update.
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Sync render fallback: if user is already in state, skip the login page
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
        toast.success('Login successful! Redirecting...');
        // Navigate immediately as primary path; useEffect above is the fallback
        navigate('/', { replace: true });
      } else {
        const { error } = await signUp(mobile, password, fullName, referralCode);
        if (error) { toast.error(error.message || 'Registration failed'); return; }
        toast.success('Account created! Redirecting...');
        navigate('/', { replace: true });
      }
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    height: 52,
    background: '#F7F8FA',
    border: '1px solid #E0E0E0',
    borderRadius: 15,
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: '#F4F6F8', fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* ── Logo ── */}
      <div className="flex flex-col items-center mb-7">
        <div
          className="w-[104px] h-[104px] rounded-[22px] bg-white flex items-center justify-center mb-4"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
        >
          <img
            src={LOGO_URL}
            alt={APP_NAME}
            className="w-full h-full object-cover"
          />
        </div>
        <p
          className="font-extrabold text-xl"
          style={{ color: '#4CAF50', letterSpacing: '0.5px' }}
        >
          — {APP_NAME} —
        </p>
      </div>

      {/* ── Form card ── */}
      <div
        className="w-full max-w-[340px] rounded-[20px] bg-white px-5 py-6"
        style={{ boxShadow: '0 4px 28px rgba(0,0,0,0.08)', border: '1px solid #ECECEC' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-[13px]">

          {/* Nickname */}
          {!isLogin && (
            <div className="flex items-center gap-3 px-4" style={inputStyle}>
              <IconUser />
              <input
                type="text"
                placeholder="Nickname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          )}

          {/* Phone */}
          <div className="flex items-center gap-2 px-4" style={inputStyle}>
            <IconPhone />
            <span className="text-sm font-bold shrink-0" style={{ color: '#555' }}>+91</span>
            <div className="w-px h-5 shrink-0" style={{ background: '#D8D8D8' }} />
            <input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              inputMode="numeric"
              maxLength={10}
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 px-4" style={inputStyle}>
            <IconLock />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 flex items-center"
            >
              <IconEye off={showPassword} />
            </button>
          </div>

          {/* Refer code */}
          {!isLogin && (
            <div className="flex items-center gap-3 px-4" style={inputStyle}>
              <IconReferral />
              <input
                type="text"
                placeholder="Enter refer code"
                value={referralCode}
                readOnly={!!lockedRef}
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          )}

          {/* Register / Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-extrabold text-white text-sm flex items-center justify-center gap-2 mt-1 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              height: 52,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              boxShadow: '0 6px 20px rgba(76,175,80,0.40)',
              letterSpacing: '1.5px',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'LOGIN NOW 🚀' : 'REGISTER NOW 🚀')}
          </button>

          {/* Toggle login/register */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-sm text-center font-medium transition-colors"
            style={{
              height: 48,
              borderRadius: 20,
              border: '1.5px solid #E0E0E0',
              background: '#fff',
              color: '#555',
              fontFamily: 'inherit',
            }}
          >
            {isLogin ? "Don't have an account? " : 'Have an account? '}
            <span style={{ color: '#4CAF50', fontWeight: 700 }}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </button>

        </form>
      </div>

      {/* Bottom safe spacing */}
      <div className="h-8" />
    </div>
  );
};

export default Login;
