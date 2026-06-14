import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Mail,
  Github,
  Globe,
  Twitter,
  Calendar,
  Heart,
  Eye,
  Users,
  Award,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { userAPI } from '@/api/users';
import { projectAPI } from '@/api/projects';
import { useAuthStore } from '@/store/authStore';
import type { User, Project } from '../../shared/types/index.js';

export default function Author() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [author, setAuthor] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      loadAuthor(parseInt(id));
      loadAuthorProjects(parseInt(id));
    }
  }, [id]);

  const loadAuthor = async (userId: number) => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile(userId);
      if (res.code === 200 && res.data) {
        setAuthor(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAuthorProjects = async (userId: number) => {
    try {
      setProjectsLoading(true);
      const res = await userAPI.getProjects(userId);
      if (res.code === 200 && res.data) {
        setProjects(res.data);
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleLike = async (projectId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    const res = await projectAPI.like(projectId);
    if (res.code === 200 && res.data) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                isLiked: res.data.liked,
                likesCount: res.data.liked ? p.likesCount + 1 : p.likesCount - 1,
              }
            : p
        )
      );
    }
  };

  const handleFavorite = async (projectId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    const res = await projectAPI.favorite(projectId);
    if (res.code === 200 && res.data) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                isFavorited: res.data.favorited,
                favoritesCount: res.data.favorited ? p.favoritesCount + 1 : p.favoritesCount - 1,
              }
            : p
        )
      );
    }
  };

  const getTotalLikes = () => {
    return projects.reduce((sum, p) => sum + p.likesCount, 0);
  };

  const getTotalViews = () => {
    return projects.reduce((sum, p) => sum + p.viewsCount, 0);
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setIsFollowing(!isFollowing);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-blue-950">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/10 rounded-full" />
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-white/10 rounded w-1/3" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-4 bg-white/10 rounded w-1/4" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/10 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white/10 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-space-blue-950">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">用户不存在</h2>
          <p className="text-gray-400 mb-6">该用户可能已被删除或不存在</p>
          <Link to="/" className="btn-primary">
            返回首页
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === author.id;

  return (
    <div className="min-h-screen bg-space-blue-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-electric-purple-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan-400 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            返回首页
          </Link>

          {/* Profile Header */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <img
                  src={author.avatar}
                  alt={author.username}
                  className="w-24 h-24 rounded-full border-4 border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-space-blue-950 ${
                  author.role === 'admin' ? 'bg-coral-red-500' :
                  author.role === 'creator' ? 'bg-neon-cyan-500' : 'bg-jade-green-500'
                }`} />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold text-white">
                    {author.username}
                  </h1>
                  <span className={`status-badge ${
                    author.role === 'admin' ? 'status-error' :
                    author.role === 'creator' ? 'status-success' : 'status-info'
                  }`}>
                    {author.role === 'admin' ? '管理员' :
                     author.role === 'creator' ? '创作者' : '用户'}
                  </span>
                  {isOwnProfile && (
                    <Link to="/profile" className="btn-secondary text-sm py-1.5 px-4">
                      编辑资料
                    </Link>
                  )}
                </div>
                <p className="text-gray-400 mb-4 max-w-2xl">
                  {author.bio || '这个人很懒，什么都没有留下...'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    加入于 {new Date(author.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>

              {!isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <a
                    href={`mailto:${author.email}`}
                    className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    联系
                  </a>
                  <button
                    onClick={handleFollow}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 ${
                      isFollowing ? 'btn-secondary border-neon-cyan-400 text-neon-cyan-400' : 'btn-primary'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-6 h-6 text-electric-purple-400" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text mb-1">
                {projects.length}
              </div>
              <div className="text-sm text-gray-400">项目总数</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-coral-red-400" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text mb-1">
                {getTotalLikes()}
              </div>
              <div className="text-sm text-gray-400">获赞总数</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="w-6 h-6 text-neon-cyan-400" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text mb-1">
                {getTotalViews()}
              </div>
              <div className="text-sm text-gray-400">浏览总数</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-jade-green-400" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text mb-1">
                {author.followersCount}
              </div>
              <div className="text-sm text-gray-400">粉丝数量</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href={`mailto:${author.email}`}
              className="glass-card p-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <Mail className="w-5 h-5 text-neon-cyan-400" />
              <span className="text-gray-400">{author.email}</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5 text-electric-purple-400" />
              <span className="text-gray-400">GitHub</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <Twitter className="w-5 h-5 text-neon-cyan-400" />
              <span className="text-gray-400">Twitter</span>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-3 flex items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <Globe className="w-5 h-5 text-electric-purple-400" />
              <span className="text-gray-400">个人网站</span>
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-white">
              TA 的项目
            </h2>
            <span className="text-gray-400">
              共 {projects.length} 个项目
            </span>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card overflow-hidden animate-pulse">
                  <div className="aspect-video bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onLike={() => handleLike(project.id)}
                  onFavorite={() => handleFavorite(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                暂无项目
              </h3>
              <p className="text-gray-400">
                {isOwnProfile ? '快去发布你的第一个项目吧！' : 'TA 还没有发布任何项目'}
              </p>
              {isOwnProfile && (
                <Link to="/publish" className="btn-primary mt-4">
                  发布项目
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
