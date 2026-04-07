import { useState, useEffect } from 'react';
import { Eye, EyeOff, Phone, Lock, User, Send } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 50%, #fafff8 100%)' }}>

      {/* Logo & App Name */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-[22px] overflow-hidden mb-3 border-4 border-white"
          style={{ boxShadow: '0 8px 32px rgba(52,168,83,0.25)' }}>
          <img src={LOGO_IMAGE} alt={APP_NAME} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-primary font-extrabold text-base">—</span>
          <h1 className="text-xl font-extrabold text-primary tracking-widest">{APP_NAME}</h1>
          <span className="text-primary font-extrabold text-base">—</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-6"
        style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.10)' }}>

        {/* Tabs */}
        <div className="flex rounded-2xl overflow-hidden bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'text-white shadow' : 'text-gray-500'}`}
            style={!isLogin ? { background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(140,60%,38%) 100%)' } : {}}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLogin ? 'text-white shadow' : 'text-gray-500'}`}
            style={isLogin ? { background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(140,60%,38%) 100%)' } : {}}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name (Register only) */}
          {!isLogin && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 h-[52px] border border-gray-200">
              <User className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Nickname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Phone */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 h-[52px] border border-gray-200">
            <Phone className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-bold text-gray-600 shrink-0">+91</span>
            <div className="w-px h-5 bg-gray-300" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              inputMode="numeric"
              maxLength={10}
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 h-[52px] border border-gray-200">
            <Lock className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 shrink-0">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Referral code (Register only) */}
          {!isLogin && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 h-[52px] border border-gray-200">
              <Send className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter refer code (optional)"
                value={referralCode}
                readOnly={!!new URLSearchParams(location.search).get('ref')}
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] text-sm font-extrabold rounded-2xl text-white tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            style={{ background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(140,60%,38%) 100%)', boxShadow: '0 4px 20px rgba(52,168,83,0.35)' }}
          >
            {loading ? 'Please wait...' : (
              <>
                <Send className="w-4 h-4" />
                {isLogin ? 'LOGIN NOW' : 'REGISTER NOW'}
              </>
            )}
          </button>

          {/* Switch */}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full h-11 text-sm font-semibold rounded-2xl border-2 text-primary bg-transparent hover:bg-green-50 transition-colors"
            style={{ borderColor: 'hsl(140,52%,43%,0.3)' }}
          >
            {isLogin ? "Don't have an account? " : 'Have an account? '}
            <span className="font-extrabold">{isLogin ? 'Register' : 'Login'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
