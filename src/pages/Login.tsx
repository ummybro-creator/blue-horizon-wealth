import { useState } from 'react';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

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
      {/* Header */}
      <div className="gradient-header pt-16 pb-20 px-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-primary-foreground">₹</span>
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">InvestPro</h1>
        <p className="text-primary-foreground/70 mt-1">Your Daily Earning Partner</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 -mt-10 px-4">
        <div className="bg-card rounded-2xl shadow-elevated p-6 animate-slide-up">
          {/* Tab Switcher */}
          <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
                isLogin 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground"
              )}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
                !isLogin 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Input */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="h-12 pl-12"
                maxLength={10}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-12"
              />
            </div>

            {/* Referral Code (Register only) */}
            {!isLogin && (
              <Input
                type="text"
                placeholder="Referral Code (Optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-12"
              />
            )}

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-primary font-medium">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button variant="gradient" size="xl" className="w-full" type="submit">
              {isLogin ? 'Login' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Terms */}
          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              By registering, you agree to our{' '}
              <button className="text-primary">Terms of Service</button>
              {' '}and{' '}
              <button className="text-primary">Privacy Policy</button>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Secure & Trusted Platform
        </p>
      </div>
    </div>
  );
};

export default Login;
