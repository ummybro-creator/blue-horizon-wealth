import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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

const BANNER_IMAGE = 'https://files.catbox.moe/9swklk.jpg';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===================== REFERRAL HANDLING ===================== */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');

    if (ref) {
      setIsLogin(false);       // auto open REGISTER
      setReferralCode(ref);   // auto fill referral
    }
  }, [location.search]);
  /* ============================================================= */

  // already logged in
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
        const { error } = await signUp(
          mobile,
          password,
          fullName,
          referralCode // ✅ referral goes to backend
        );
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
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      {/* Banner */}
      <div className="relative h-64">
        <img src={BANNER_IMAGE} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Logo */}
      <div className="flex justify-center -mt-16 z-10">
        <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white">
          <img src={LOGO_IMAGE} className="w-24 h-24 rounded-full object-cover" />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 pt-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-14 rounded-xl"
            />
          )}

          <div className="flex items-center border rounded-xl overflow-hidden">
            <div className="px-4 text-sm text-muted-foreground">🇮🇳 +91</div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              className="h-14 border-0"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 pr-12 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-muted-foreground"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {!isLogin && (
            <Input
              placeholder="Referral Code"
              value={referralCode}
              readOnly
              className="h-14 rounded-xl bg-muted"
            />
          )}

          {isLogin && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(Boolean(v))}
              />
              <span className="text-sm">Remember Me</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-green-700 hover:bg-green-800"
          >
            {loading
              ? 'Please wait...'
              : isLogin
              ? 'SIGN IN'
              : 'REGISTER'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-700 font-medium"
            >
              {isLogin
                ? "Don't have account? Register"
                : 'Already have account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
