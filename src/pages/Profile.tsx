import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Edit3,
  Save,
  X,
  ChevronLeft,
  Settings,
  Heart,
  Eye,
  Award,
  Users,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData({
        username: user.username,
        bio: user.bio || '',
        email: user.email,
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // 实际项目中这里应该调用更新用户信息的API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 更新store中的用户信息
      useAuthStore.getState().setUser({
        ...user!,
        username: formData.username,
        bio: formData.bio,
      });
      setEditing(false);
      alert('个人信息已更新！');
    } catch (err) {
      alert('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        bio: user.bio || '',
        email: user.email,
      });
    }
    setEditing(false);
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: Settings, label: '账号设置', href: '#settings' },
    { icon: Heart, label: '我的收藏', href: '/collections' },
    { icon: Award, label: '我的项目', href: `/author/${user.id}` },
  ];

  return (
    <div className="min-h-screen bg-space-blue-950">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan-400 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </button>

          <div className="glass-card p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-20 h-20 rounded-full border-4 border-white/10"
                  />
                  <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-neon-cyan-500 text-white hover:bg-neon-cyan-400 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-white mb-1">
                    {editing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="input-field text-xl py-1 px-3"
                        maxLength={20}
                      />
                    ) : (
                      user.username
                    )}
                  </h1>
                  <p className="text-gray-400">
                    {user.role === 'admin'
                      ? '管理员'
                      : user.role === 'creator'
                      ? '创作者'
                      : '用户'}
                  </p>
                </div>
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑资料
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    保存
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-electric-purple-400" />
                </div>
                <div className="font-display text-2xl font-bold gradient-text">0</div>
                <div className="text-sm text-gray-400">项目</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-coral-red-400" />
                </div>
                <div className="font-display text-2xl font-bold gradient-text">0</div>
                <div className="text-sm text-gray-400">获赞</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-neon-cyan-400" />
                </div>
                <div className="font-display text-2xl font-bold gradient-text">0</div>
                <div className="text-sm text-gray-400">浏览</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-jade-green-400" />
                </div>
                <div className="font-display text-2xl font-bold gradient-text">
                  {user.followersCount}
                </div>
                <div className="text-sm text-gray-400">粉丝</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  个人简介
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="介绍一下你自己..."
                    className="input-field min-h-[100px] resize-none"
                    maxLength={200}
                  />
                ) : (
                  <p className="text-gray-300">
                    {user.bio || '这个人很懒，什么都没有留下...'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  邮箱地址
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Mail className="w-5 h-5 text-neon-cyan-400" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="glass-card p-6 mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-4">快捷菜单</h2>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan-400 transition-colors" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-gray-500 ml-auto rotate-180" />
                </Link>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 border border-coral-red-400/30">
            <h2 className="font-display text-lg font-bold text-coral-red-400 mb-4">危险操作</h2>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-xl border border-coral-red-400/30 text-coral-red-400 hover:bg-coral-red-500/10 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
