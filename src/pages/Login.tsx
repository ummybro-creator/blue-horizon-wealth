import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const { data: settings } = useAppSettings();
  
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      phoneSchema.parse(mobile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(mobile, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid phone number or password');
          } else if (error.message.includes('blocked')) {
            toast.error(error.message);
          } else {
            toast.error('Login failed. Please check your credentials.');
          }
          return;
        }
        toast.success('Login successful!');
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        const { error } = await signUp(mobile, password, fullName, referralCode);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This phone number is already registered');
          } else {
            toast.error('Registration failed. Please try again.');
          }
          return;
        }
        toast.success('Account created successfully!');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      {/* Header Banner */}
      <div className="gradient-header h-64 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-foreground mb-1">
              {settings?.app_name || 'TATA NAMAK'}
            </h1>
            <p className="text-primary-foreground/80 text-sm">SABSE ZYADA SHUDDHATA</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Logo */}
      <div className="flex justify-center -mt-12 relative z-10">
        <div className="w-24 h-24 rounded-full bg-amber-900 flex items-center justify-center shadow-elevated border-4 border-card">
          <div className="text-center">
            <span className="text-primary-foreground font-bold text-lg">TATA</span>
            <span className="text-amber-400 font-bold text-sm block">Salt</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-4 pt-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Register only) */}
          {!isLogin && (
            <div className="relative flex items-center border border-border rounded-xl overflow-hidden bg-card">
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 border-0 focus-visible:ring-0"
              />
            </div>
          )}

          {/* Mobile Input */}
          <div className="relative flex items-center border border-border rounded-xl overflow-hidden bg-card">
            <div className="flex items-center gap-2 px-4 border-r border-border">
              <span className="text-lg">🇮🇳</span>
              <span className="text-muted-foreground">+91</span>
            </div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="h-14 border-0 focus-visible:ring-0"
              maxLength={10}
            />
          </div>

          {/* Password Input */}
          <div className="relative flex items-center border border-border rounded-xl overflow-hidden bg-card">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 border-0 focus-visible:ring-0 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Referral Code (Register only) */}
          {!isLogin && (
            <div className="relative flex items-center border border-border rounded-xl overflow-hidden bg-card">
              <Input
                type="text"
                placeholder="Referral Code (Optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-14 border-0 focus-visible:ring-0"
              />
            </div>
          )}

          {/* Remember Me */}
          {isLogin && (
            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-foreground">
                Remember Me
              </label>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            variant="gradient" 
            size="xl" 
            className="w-full h-14 text-lg font-bold" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'SIGN IN' : 'REGISTER'
            )}
          </Button>

          {/* Toggle Login/Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium"
            >
              {isLogin ? "Don't have account, register" : "Already have account, login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
