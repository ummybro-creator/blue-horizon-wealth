import { useState } from 'react';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
      {/* Header Banner */}
      <div className="gradient-header h-64 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary-foreground mb-1">TATA NAMAK</h1>
            <p className="text-primary-foreground/80 text-sm">SABSE ZYADA SHUDDHATA</p>
          </div>
        </div>
        {/* Decorative elements */}
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
              onChange={(e) => setMobile(e.target.value)}
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
          <Button variant="gradient" size="xl" className="w-full h-14 text-lg font-bold" type="submit">
            {isLogin ? 'SIGN IN' : 'REGISTER'}
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
