import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Phone, Lock, Gift, User, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const ORANGE = '#FF6A1A';
const ORANGE_DARK = '#F25A00';

/* Diamond/V logo */
const BrandLogo = () => (
  <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFB27A" />
        <stop offset="60%" stopColor="#FF7A2E" />
        <stop offset="100%" stopColor="#E24E00" />
      </linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF8A3D" />
        <stop offset="100%" stopColor="#C93F00" />
      </linearGradient>
    </defs>
    <path d="M10 22 L38 22 L50 50 L28 44 Z" fill="url(#lg1)" />
    <path d="M90 22 L62 22 L50 50 L72 44 Z" fill="url(#lg1)" />
    <path d="M28 44 L72 44 L50 92 Z" fill="url(#lg2)" />
    <path d="M50 50 L50 92 L28 44 Z" fill="#ffffff" opacity="0.12" />
  </svg>
);

const FieldLabel = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon className="w-5 h-5" style={{ color: ORANGE }} strokeWidth={2.2} />
    <span className="font-bold text-[15px] text-gray-900">{text}</span>
  </div>
);

const inputWrap: React.CSSProperties = {
  height: 56,
  background: '#fff',
  border: `1.5px solid ${ORANGE}55`,
  borderRadius: 14,
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
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
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #FFE4CC 0%, #FFF6EE 32%, #FFFFFF 55%, #FFFFFF 78%, #FFE0C2 100%)',
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -left-16 top-16 w-56 h-56 rounded-full" style={{ background: '#FFCFA5', opacity: 0.35 }} />
      <div className="absolute right-6 top-40 w-4 h-4 rounded-full" style={{ background: '#FFB37A', opacity: 0.5 }} />
      <div className="absolute right-10 top-56 w-2 h-2 rounded-full" style={{ background: '#FFB37A', opacity: 0.6 }} />
      {/* Dot grid */}
      <div className="absolute right-4 top-24 grid grid-cols-6 gap-1.5 opacity-40">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full" style={{ background: ORANGE }} />
        ))}
      </div>

      {/* Bottom skyline silhouette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #FFD3AC 60%, #FFB77A 100%)',
          clipPath: 'polygon(0 40%, 8% 55%, 15% 45%, 22% 60%, 30% 50%, 38% 62%, 46% 48%, 55% 58%, 63% 45%, 72% 60%, 82% 50%, 92% 62%, 100% 55%, 100% 100%, 0 100%)',
          opacity: 0.7,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-10 pb-8 max-w-md mx-auto w-full">
        <BrandLogo />
        <h1 className="mt-4 text-[38px] font-extrabold text-gray-900 leading-tight">
          {isLogin ? 'Welcome Back!' : 'Welcome!'}
        </h1>
        <p className="text-gray-500 text-[15px] mt-1 mb-8">
          {isLogin ? 'Login to continue your journey' : 'Create your account to get started'}
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Phone */}
          <div>
            <FieldLabel icon={Phone} text="Phone (India)" />
            <div className="flex items-center px-4" style={inputWrap}>
              <div className="flex items-center gap-1.5 pr-3 shrink-0">
                <div className="w-7 h-5 rounded-sm overflow-hidden flex flex-col shadow-sm">
                  <div className="flex-1" style={{ background: '#FF9933' }} />
                  <div className="flex-1 bg-white relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full border" style={{ borderColor: '#000080' }} />
                    </div>
                  </div>
                  <div className="flex-1" style={{ background: '#138808' }} />
                </div>
                <span className="font-semibold text-gray-800 text-[15px]">+91</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-px h-6 bg-gray-200 mr-3" />
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                maxLength={10}
                className="flex-1 bg-transparent text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <FieldLabel icon={Lock} text="Password" />
            <div className="flex items-center px-4" style={inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="shrink-0 text-gray-500">
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              {/* Refer Code */}
              <div>
                <FieldLabel icon={Gift} text="Refer Code (Optional)" />
                <div className="flex items-center px-4" style={inputWrap}>
                  <input
                    type="text"
                    placeholder="Enter refer code"
                    value={referralCode}
                    readOnly={!!lockedRef}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Nickname */}
              <div>
                <FieldLabel icon={User} text="Nickname" />
                <div className="flex items-center px-4" style={inputWrap}>
                  <input
                    type="text"
                    placeholder="Enter your nickname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold text-[18px] transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
            style={{
              height: 58,
              borderRadius: 16,
              background: `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`,
              boxShadow: '0 10px 24px rgba(242,90,0,0.35)',
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>

          {/* Toggle */}
          <p className="text-center text-[14px] text-gray-500 mt-2">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold"
              style={{ color: ORANGE_DARK }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
