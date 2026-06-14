import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ChevronLeft, Heart, Eye, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { userAPI } from '@/api/users';
import { projectAPI } from '@/api/projects';
import { useAuthStore } from '@/store/authStore';
import type { Project } from '../../shared/types/index.js';

export default function Collections() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadFavorites();
  }, [isAuthenticated, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getFavorites();
      if (res.code === 200 && res.data) {
        setProjects(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (projectId: number) => {
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
    const res = await projectAPI.favorite(projectId);
    if (res.code === 200 && res.data) {
      setProjects((prev) =>
        prev.filter((p) => p.id !== projectId)
      );
    }
  };

  const getTotalStats = () => {
    return {
      likes: projects.reduce((sum, p) => sum + p.likesCount, 0),
      views: projects.reduce((sum, p) => sum + p.viewsCount, 0),
    };
  };

  return (
    <div className="min-h-screen bg-space-blue-950">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan-400 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </button>

          {/* Header */}
          <div className="glass-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-neon-cyan-500/20">
                <Bookmark className="w-8 h-8 text-neon-cyan-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-1">
                  我的收藏
                </h1>
                <p className="text-gray-400">收藏的项目会保存在这里，方便随时查看</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <Bookmark className="w-6 h-6 text-neon-cyan-400" />
                <div>
                  <div className="font-display text-2xl font-bold text-white">
                    {projects.length}
                  </div>
                  <div className="text-sm text-gray-400">收藏项目</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <Heart className="w-6 h-6 text-coral-red-400" />
                <div>
                  <div className="font-display text-2xl font-bold text-white">
                    {getTotalStats().likes}
                  </div>
                  <div className="text-sm text-gray-400">总获赞数</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <Eye className="w-6 h-6 text-electric-purple-400" />
                <div>
                  <div className="font-display text-2xl font-bold text-white">
                    {getTotalStats().views}
                  </div>
                  <div className="text-sm text-gray-400">总浏览量</div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
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
              <div className="text-6xl mb-4">🔖</div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                还没有收藏项目
              </h3>
              <p className="text-gray-400 mb-6">
                浏览项目时点击收藏按钮，就可以在这里快速找到它们
              </p>
              <Link to="/" className="btn-primary">
                去发现项目
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
