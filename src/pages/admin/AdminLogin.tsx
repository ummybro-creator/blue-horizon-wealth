import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, isAdmin, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user && isAdmin) { navigate('/admin/dashboard', { replace: true }); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      const { error } = await signIn(email.replace('@app.local', '').replace(/\D/g, '') || email, password);
      if (error) { toast.error('Invalid admin credentials'); return; }
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch { toast.error('Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center clay-button">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Admin Panel</h1>
        <p className="text-muted-foreground text-center mb-8">Sign in to manage your platform</p>

        <div className="clay-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input type="email" placeholder="Enter admin email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl clay-inset border-none" />
            </div>
            <div className="relative">
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl clay-inset border-none pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3 text-muted-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" className="w-full h-12 text-lg font-bold rounded-2xl clay-button disabled:opacity-50 transition-all active:scale-[0.97]" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
