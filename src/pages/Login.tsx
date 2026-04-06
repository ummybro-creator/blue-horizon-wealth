import { useState, useEffect } from 'react';
import { Eye, EyeOff, Send, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const BANNER_IMAGE = 'https://files.catbox.moe/ksfp44.jpg';
const LOGO_IMAGE = 'https://files.catbox.moe/ar4gt6.jpg';

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

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) { setIsLogin(false); setReferralCode(ref); }
  }, [location.search]);

  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  if (user) { navigate('/', { replace: true }); return null; }

  const handleSendOtp = () => {
    try { phoneSchema.parse(mobile); } catch { toast.error('Enter a valid 10-digit phone number'); return; }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setOtpTimer(60);
    toast.success(`OTP sent to +91 ${mobile}`, { description: `Your OTP is: ${otp}` });
  };

  const handleVerifyOtp = () => {
    if (otpCode === generatedOtp) {
      setOtpVerified(true);
      toast.success('Phone number verified!');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { phoneSchema.parse(mobile); passwordSchema.parse(password); }
    catch (err: any) { toast.error(err.errors?.[0]?.message || 'Invalid input'); return; }

    if (!isLogin && !otpVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(mobile, password);
        if (error) { toast.error('Invalid phone number or password'); return; }
        toast.success('Login successful'); navigate('/');
      } else {
        const { error } = await signUp(mobile, password, fullName, referralCode);
        if (error) { toast.error(error.message || 'Registration failed'); return; }
        toast.success('Account created successfully'); navigate('/');
      }
    } finally { setLoading(false); }
  };

  // Reset OTP when switching tabs or changing phone
  const handleTabSwitch = (login: boolean) => {
    setIsLogin(login);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode('');
    setGeneratedOtp('');
  };

  return (
    <div className="min-h-screen flex flex-col app-bg">
      {/* Banner */}
      <div className="relative w-full h-48 overflow-hidden" style={{ borderRadius: '0 0 30px 30px' }}>
        <img src={BANNER_IMAGE} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, hsl(140, 52%, 43%) 100%)' }} />
      </div>

      {/* Logo */}
      <div className="flex justify-center -mt-14 relative z-10">
        <div className="w-28 h-28 rounded-3xl shadow-clay overflow-hidden border-4 border-white">
          <img src={LOGO_IMAGE} className="w-full h-full object-cover" alt="Logo" />
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex justify-center mt-4 px-8">
        <div className="clay-card flex w-full max-w-xs p-1.5" style={{ borderRadius: '999px' }}>
          <button type="button" onClick={() => handleTabSwitch(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${isLogin ? 'clay-button' : 'text-muted-foreground'}`}>
            Login
          </button>
          <button type="button" onClick={() => handleTabSwitch(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${!isLogin ? 'clay-button' : 'text-muted-foreground'}`}>
            Register
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 mt-5 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              placeholder="Username"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-13 rounded-2xl clay-inset border-none px-5 text-base placeholder:text-muted-foreground"
            />
          )}

          <div className="relative">
            <Input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                if (!isLogin) { setOtpSent(false); setOtpVerified(false); setOtpCode(''); }
              }}
              className="h-13 rounded-2xl clay-inset border-none pl-14 pr-5 text-base placeholder:text-muted-foreground"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+91</span>
          </div>

          {/* OTP Section for Registration */}
          {!isLogin && !otpVerified && (
            <div className="space-y-3">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={mobile.length !== 10}
                  className="w-full h-12 rounded-2xl clay-inset border-2 border-dashed border-primary/30 text-primary font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:border-primary/50"
                >
                  <Send className="w-4 h-4" />
                  Send OTP
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="h-13 rounded-2xl clay-inset border-none px-5 text-center text-lg font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:text-sm"
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpCode.length !== 4}
                      className="h-13 px-5 rounded-2xl clay-button text-sm font-bold disabled:opacity-40 whitespace-nowrap"
                    >
                      Verify
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-xs text-muted-foreground">
                      {otpTimer > 0 ? `Resend in ${otpTimer}s` : ''}
                    </p>
                    {otpTimer === 0 && (
                      <button type="button" onClick={handleSendOtp} className="text-xs text-primary font-semibold">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verified badge */}
          {!isLogin && otpVerified && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Phone verified</span>
            </div>
          )}

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-13 rounded-2xl clay-inset border-none px-5 pr-12 text-base placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {!isLogin && (
            <Input
              placeholder="Refer Code (optional)"
              value={referralCode}
              readOnly={!!referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="h-13 rounded-2xl clay-inset border-none px-5 text-base font-medium placeholder:text-muted-foreground"
            />
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading || (!isLogin && !otpVerified)}
              className="w-full h-14 text-lg font-bold rounded-full clay-button disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Please wait...' : (
                <>
                  <Send className="w-5 h-5" />
                  {isLogin ? 'Login Now' : 'Register Now'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
