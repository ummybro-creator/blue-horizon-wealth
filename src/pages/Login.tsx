import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Phone, Lock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

const LOGO_IMAGE = 'https://files.catbox.moe/i56n87.jpg';

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
    if (ref) {
      setIsLogin(false);
      setReferralCode(ref);
    }
  }, [location.search]);

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

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
        if (error) {
          toast.error('Invalid phone number or password');
          return;
        }
        toast.success('Login successful');
        navigate('/');
      } else {
        const { error } = await signUp(mobile, password, fullName, referralCode);
        if (error) {
          toast.error(error.message || 'Registration failed');
          return;
        }
        toast.success('Account created successfully');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0FDF4' }}>
      {/* Green gradient header */}
      <div
        className="relative flex flex-col items-center justify-center pt-8 pb-14 rounded-b-[2.5rem]"
        style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}
      >
        <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white/80">
          <img src={LOGO_IMAGE} className="w-16 h-16 rounded-full object-cover" alt="Logo" />
        </div>
        <h1 className="text-white text-xl font-bold mt-3 tracking-wide">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-white/80 text-sm mt-0.5">
          {isLogin ? 'Sign in to continue' : 'Register to get started'}
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-8 pb-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
          style={{ border: '1px solid #E5E7EB' }}
        >
          {/* Full Name (register only) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6B7280' }} />
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-13 pl-11 rounded-xl border-border"
              />
            </div>
          )}

          {/* Phone */}
          <div className="relative flex items-center rounded-xl overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
            <div className="pl-3 pr-2 text-sm font-medium flex items-center gap-1" style={{ color: '#6B7280' }}>
              <Phone className="w-4 h-4" />
              +91
            </div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="h-13 border-0 focus-visible:ring-0 shadow-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6B7280' }} />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-13 pl-11 pr-12 rounded-xl border-border"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#6B7280' }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Referral Code (register only) */}
          {!isLogin && (
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6B7280' }} />
              <Input
                placeholder="Referral Code (optional)"
                value={referralCode}
                readOnly={!!referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-13 pl-11 rounded-xl border-border bg-muted/50"
              />
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 text-lg font-bold rounded-xl text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'SIGN IN' : 'REGISTER'}
          </Button>

          {/* Toggle */}
          <p className="text-center text-sm" style={{ color: '#6B7280' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold"
              style={{ color: '#16A34A' }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
