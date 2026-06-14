import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, User, LogOut, Settings, Sparkles, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-space-blue-950/90 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan-400 to-electric-purple-500 flex items-center justify-center group-hover:animate-glow transition-all">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">
              AI 项目广场
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索 AI 项目..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/publish" className="btn-primary flex items-center gap-2 py-2">
                  <Plus className="w-5 h-5" />
                  发布项目
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 btn-ghost">
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-neon-cyan-400 transition-colors"
                    />
                    <span className="text-sm">{user?.username}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        个人中心
                      </Link>
                      <Link
                        to="/collections"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        我的收藏
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          管理后台
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-coral-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  登录
                </Link>
                <Link to="/register" className="btn-primary py-2">
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-space-blue-950/95 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索 AI 项目..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan-400/50"
                />
              </div>
            </form>

            {isAuthenticated ? (
              <>
                <Link
                  to="/publish"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="w-5 h-5" />
                  发布项目
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  个人中心
                </Link>
                <Link
                  to="/collections"
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  我的收藏
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    管理后台
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-coral-red-400 hover:bg-white/5 rounded-lg"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="flex-1 btn-secondary text-center py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="flex-1 btn-primary text-center py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
