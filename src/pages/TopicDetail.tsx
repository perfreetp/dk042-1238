import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, Eye, Heart, Bookmark } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { topicAPI } from '@/api/topics';
import { projectAPI } from '@/api/projects';
import { useAuthStore } from '@/store/authStore';
import type { Topic, Project } from '../../shared/types/index.js';

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTopic(parseInt(id));
    }
  }, [id]);

  const loadTopic = async (topicId: number) => {
    try {
      setLoading(true);
      setError('');
      const res = await topicAPI.getDetail(topicId);
      if (res.code === 200 && res.data) {
        setTopic(res.data);
      } else {
        setError(res.message || '专题不存在');
      }
    } catch (err: any) {
      setError(err.message || '加载专题失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (projectId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await projectAPI.like(projectId);
    if (res.code === 200 && res.data && topic?.projects) {
      setTopic({
        ...topic,
        projects: topic.projects.map((p: Project) =>
          p.id === projectId
            ? {
                ...p,
                isLiked: res.data!.liked,
                likesCount: res.data!.liked ? p.likesCount + 1 : p.likesCount - 1,
              }
            : p
        ),
      });
    }
  };

  const handleFavorite = async (projectId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await projectAPI.favorite(projectId);
    if (res.code === 200 && res.data && topic?.projects) {
      setTopic({
        ...topic,
        projects: topic.projects.map((p: Project) =>
          p.id === projectId
            ? {
                ...p,
                isFavorited: res.data!.favorited,
                favoritesCount: res.data!.favorited ? p.favoritesCount + 1 : p.favoritesCount - 1,
              }
            : p
        ),
      });
    }
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

          {loading ? (
            <div className="space-y-8">
              <div className="glass-card overflow-hidden">
                <div className="h-64 bg-white/10 animate-pulse" />
                <div className="p-8 space-y-4">
                  <div className="h-10 bg-white/10 rounded w-1/3 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">出错了</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <Link to="/" className="btn-primary">返回首页</Link>
            </div>
          ) : topic ? (
            <>
              {/* Topic Hero */}
              <div className="glass-card overflow-hidden mb-10">
                <div className="relative h-64 md:h-80">
                  <img
                    src={topic.coverImage}
                    alt={topic.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-blue-950 via-space-blue-950/70 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-electric-purple-500/30 backdrop-blur-sm border border-electric-purple-400/30">
                        <Sparkles className="w-8 h-8 text-electric-purple-400" />
                      </div>
                      <div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                          {topic.title}
                        </h1>
                        <p className="text-gray-300 max-w-2xl">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-neon-cyan-500/20">
                        <Bookmark className="w-5 h-5 text-neon-cyan-400" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-bold text-white">
                          {topic.projectIds?.length || 0}
                        </div>
                        <div className="text-sm text-gray-400">收录项目</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-jade-green-500/20">
                        <Eye className="w-5 h-5 text-jade-green-400" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-bold text-white">
                          {topic.projects?.reduce((sum: number, p: Project) => sum + p.viewsCount, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-400">总浏览量</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-coral-red-500/20">
                        <Heart className="w-5 h-5 text-coral-red-400" />
                      </div>
                      <div>
                        <div className="font-display text-xl font-bold text-white">
                          {topic.projects?.reduce((sum: number, p: Project) => sum + p.likesCount, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-400">总获赞数</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-neon-cyan-400" />
                  收录项目
                  <span className="text-lg text-gray-400 font-normal">
                    ({topic.projects?.length || 0})
                  </span>
                </h2>
              </div>

              {topic.projects && topic.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {topic.projects.map((project: Project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onLike={() => handleLike(project.id)}
                      onFavorite={() => handleFavorite(project.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    该专题还没有收录项目
                  </h3>
                  <p className="text-gray-400 mb-6">
                    管理员会尽快为这个专题添加优质项目
                  </p>
                  <Link to="/" className="btn-primary">去发现项目</Link>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}
