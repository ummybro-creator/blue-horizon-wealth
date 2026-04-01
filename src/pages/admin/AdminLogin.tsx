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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-clay-dark" style={{ background: 'linear-gradient(135deg, #34A853, #2FA24F)' }}>
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Panel</h1>
        <p className="text-slate-400 text-center mb-8">Sign in to manage your platform</p>

        <div className="rounded-3xl p-6 shadow-clay-dark" style={{ background: '#1E293B' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Email</label>
              <Input type="email" placeholder="Enter admin email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl border-none text-white placeholder:text-slate-500" style={{ background: '#0F172A', boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.03)' }} />
            </div>
            <div className="relative">
              <label className="text-sm text-slate-300 mb-1 block">Password</label>
              <Input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl border-none text-white placeholder:text-slate-500 pr-12" style={{ background: '#0F172A', boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.03)' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3 text-slate-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" className="w-full h-12 text-lg font-bold rounded-2xl text-white disabled:opacity-50 transition-all active:scale-[0.97]" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #34A853, #2FA24F)', boxShadow: '6px 6px 16px rgba(52,168,83,0.2), -3px -3px 10px rgba(255,255,255,0.02)' }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
