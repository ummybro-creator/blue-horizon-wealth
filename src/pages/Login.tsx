import { useState, useEffect } from 'react';
import { Eye, EyeOff, Send } from 'lucide-react';
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

const BANNER_IMAGE = 'https://files.catbox.moe/ksfp44.jpg';
const LOGO_IMAGE = 'https://files.catbox.moe/vkrxye.jpg';

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, hsl(140, 52%, 43%) 0%, hsl(138, 47%, 85%) 50%, hsl(138, 47%, 93%) 100%)' }}
    >
      {/* Banner image section */}
      <div className="relative w-full h-48 overflow-hidden rounded-b-[2.5rem]">
        <img
          src={BANNER_IMAGE}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay to blend into background */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, hsl(140, 52%, 43%) 100%)' }}
        />
      </div>

      {/* Logo overlapping banner */}
      <div className="flex justify-center -mt-14 relative z-10">
        <div className="w-28 h-28 rounded-full border-4 shadow-xl overflow-hidden"
          style={{ borderColor: 'hsl(140, 52%, 43%)' }}>
          <img src={LOGO_IMAGE} className="w-full h-full object-cover scale-125" alt="Logo" />
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex justify-center mt-4 px-8">
        <div className="flex rounded-full overflow-hidden shadow-md w-full max-w-xs"
          style={{ background: 'hsl(142, 78%, 90%)' }}>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className="flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-200"
            style={{
              background: isLogin ? 'hsl(142, 78%, 36%)' : 'transparent',
              color: isLogin ? 'white' : 'hsl(142, 78%, 30%)',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className="flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-200"
            style={{
              background: !isLogin ? 'hsl(142, 78%, 36%)' : 'transparent',
              color: !isLogin ? 'white' : 'hsl(142, 78%, 30%)',
            }}
          >
            Register
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 mt-5 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (register only) */}
          {!isLogin && (
            <Input
              placeholder="Username"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-13 rounded-full bg-white border-0 shadow-md px-5 text-base placeholder:text-muted-foreground"
            />
          )}

          {/* Phone */}
          <div className="relative">
            <Input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="h-13 rounded-full bg-white border-0 shadow-md pl-14 pr-5 text-base placeholder:text-muted-foreground"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+91</span>
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-13 rounded-full bg-white border-0 shadow-md px-5 pr-12 text-base placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Referral Code (register only) */}
          {!isLogin && (
            <Input
              placeholder="Refer Code (optional)"
              value={referralCode}
              readOnly={!!referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="h-13 rounded-full bg-white border-0 shadow-md px-5 text-base font-medium placeholder:text-muted-foreground placeholder:font-medium"
            />
          )}

          {/* Submit */}
          <div className="pt-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold rounded-full text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, hsl(142, 78%, 36%), hsl(142, 71%, 55%))' }}
            >
              {loading ? (
                'Please wait...'
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {isLogin ? 'Login Now' : 'Register Now'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
