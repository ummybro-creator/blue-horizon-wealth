import { useState, useEffect } from 'react';
import { Eye, EyeOff, Phone, Lock, User, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const LOGO_IMAGE = 'https://files.catbox.moe/czrznu.jpg';
const APP_NAME = 'Veltrix';

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

  if (user) { navigate('/', { replace: true }); return null; }

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
        toast.success('Login successful');
        navigate('/');
      } else {
        const { error } = await signUp(mobile, password, fullName, referralCode);
        if (error) { toast.error(error.message || 'Registration failed'); return; }
        toast.success('Account created successfully');
        navigate('/');
      }
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: '#eef0f8' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-24 h-24 rounded-[24px] overflow-hidden bg-white mb-4"
          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.12)' }}
        >
          <img src={LOGO_IMAGE} alt={APP_NAME} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base" style={{ color: 'hsl(140,52%,43%)' }}>—</span>
          <span className="font-extrabold text-xl tracking-widest" style={{ color: 'hsl(140,52%,43%)' }}>
            {APP_NAME}
          </span>
          <span className="font-extrabold text-base" style={{ color: 'hsl(140,52%,43%)' }}>—</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        {/* Nickname — Register only */}
        {!isLogin && (
          <div
            className="flex items-center gap-3 bg-white rounded-full px-4 h-[54px]"
            style={{ border: '1.5px solid #d8d9e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <User className="w-5 h-5 shrink-0" style={{ color: '#888bae' }} />
            <input
              type="text"
              placeholder="Nickname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Phone */}
        <div
          className="flex items-center gap-3 bg-white rounded-full px-4 h-[54px]"
          style={{ border: '1.5px solid #d8d9e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <Phone className="w-5 h-5 shrink-0" style={{ color: '#4db06a' }} />
          <span className="text-sm font-bold text-gray-600 shrink-0">+91</span>
          <div className="w-px h-5 bg-gray-300" />
          <input
            type="tel"
            placeholder="Phone Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        {/* Password */}
        <div
          className="flex items-center gap-3 bg-white rounded-full px-4 h-[54px]"
          style={{ border: '1.5px solid #d8d9e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <Lock className="w-5 h-5 shrink-0" style={{ color: '#888bae' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="shrink-0" style={{ color: '#888bae' }}>
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Refer code — Register only */}
        {!isLogin && (
          <div
            className="flex items-center gap-3 bg-white rounded-full px-4 h-[54px]"
            style={{ border: '1.5px solid #d8d9e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <Gift className="w-5 h-5 shrink-0" style={{ color: '#888bae' }} />
            <input
              type="text"
              placeholder="Enter refer code (optional)"
              value={referralCode}
              readOnly={!!lockedRef}
              onChange={(e) => setReferralCode(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[54px] rounded-full text-white font-extrabold text-base tracking-widest flex items-center justify-center gap-2 mt-2 disabled:opacity-60 transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(140,60%,38%) 100%)',
            boxShadow: '0 5px 22px rgba(52,168,83,0.42)',
          }}
        >
          {loading ? 'Please wait...' : (isLogin ? 'LOGIN NOW 🚀' : 'REGISTER NOW 🚀')}
        </button>

        {/* Switch */}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full h-[50px] rounded-full text-sm font-semibold bg-white transition-colors hover:bg-gray-50"
          style={{
            border: '1.5px solid #d8d9e4',
            color: 'hsl(140,52%,43%)',
          }}
        >
          {isLogin ? "Don't have an account? " : 'Have an account? '}
          <span className="font-extrabold">{isLogin ? 'Register' : 'Login'}</span>
        </button>
      </form>
    </div>
  );
};

export default Login;
