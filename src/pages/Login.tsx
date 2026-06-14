import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authAPI } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authAPI.login(formData);
      if (res.code === 200 && res.data) {
        login(res.data.token, res.data.user);
        navigate(from, { replace: true });
      } else {
        throw new Error(res.message || '登录失败');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    const demoCredentials = role === 'admin'
      ? { email: 'admin@aiplaza.com', password: 'admin123' }
      : { email: 'user@example.com', password: 'admin123' };
    setFormData(demoCredentials);
    try {
      setLoading(true);
      const res = await authAPI.login(demoCredentials);
      if (res.code === 200 && res.data) {
        login(res.data.token, res.data.user);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-blue-950 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan-500 to-electric-purple-500 mb-4 shadow-[0_0_30px_rgba(34,211,238,0.3)">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              欢迎回来
            </h1>
            <p className="text-gray-400">
              登录账号继续探索精彩的 AI 项目
            </p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-coral-red-500/20 border border-coral-red-400/30 text-coral-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="input-field pl-12"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="input-field pl-12 pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-neon-cyan-400"
                  />
                  <span className="text-sm text-gray-400">记住我</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-neon-cyan-400 hover:text-neon-cyan-300 transition-colors">
                  忘记密码？
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                登录
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-gray-500 bg-space-blue-950">
                  或使用演示账号
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                disabled={loading}
                className="btn-secondary text-sm disabled:opacity-50 text-left"
              >
                <div className="font-medium">普通用户登录</div>
                <div className="text-xs text-gray-400 mt-1">user@example.com / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="btn-secondary text-sm disabled:opacity-50 text-left"
              >
                <div className="font-medium">管理员登录</div>
                <div className="text-xs text-gray-400 mt-1">admin@aiplaza.com / admin123</div>
              </button>
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              还没有账号？{' '}
              <Link to="/register" className="text-neon-cyan-400 hover:text-neon-cyan-300 transition-colors">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
