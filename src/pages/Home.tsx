import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, Sparkles, Clock, Eye, Heart, ChevronRight, Flame, FileText, Image, Briefcase, GraduationCap, Gamepad2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { projectAPI } from '@/api/projects';
import { categoryAPI } from '@/api/categories';
import { topicAPI } from '@/api/topics';
import { useAuthStore } from '@/store/authStore';
import type { Project, Category, Topic } from '../../shared/types/index.js';

const categoryIcons: Record<string, any> = {
  'file-text': FileText,
  'image': Image,
  'briefcase': Briefcase,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [hotProjects, setHotProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotLoading, setHotLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'views' | 'likes'>('latest');
  const { isAuthenticated } = useAuthStore();

  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      if (res.code === 200 && res.data) {
        setCategories(res.data);
      }
    });

    topicAPI.getAll().then((res) => {
      if (res.code === 200 && res.data) {
        setTopics(res.data);
      }
    });

    loadHotProjects();
  }, []);

  useEffect(() => {
    setPage(1);
    setProjects([]);
    setHasMore(true);
    loadProjects(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const loadHotProjects = async () => {
    try {
      const res = await projectAPI.getHot(10);
      if (res.code === 200 && res.data) {
        setHotProjects(res.data);
      }
    } finally {
      setHotLoading(false);
    }
  };

  const loadProjects = async (pageNum: number) => {
    try {
      setLoading(true);
      const params: any = {
        page: pageNum,
        pageSize: 12,
        sort: sortBy,
      };
      if (selectedCategory) params.categoryId = parseInt(selectedCategory);
      if (searchQuery) params.search = searchQuery;

      const res = await projectAPI.getList(params);
      if (res.code === 200 && res.data) {
        if (pageNum === 1) {
          setProjects(res.data.items);
        } else {
          setProjects((prev) => [...prev, ...res.data.items]);
        }
        setHasMore(res.data.hasMore);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProjects(nextPage);
    }
  };

  const handleCategoryClick = (categoryId: number | null) => {
    if (categoryId === null) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId.toString());
    }
    setSearchParams(searchParams);
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
      setHotProjects((prev) =>
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

  const sortOptions = [
    { value: 'latest', label: '最新', icon: Clock },
    { value: 'hot', label: '最热', icon: Flame },
    { value: 'views', label: '浏览', icon: Eye },
    { value: 'likes', label: '点赞', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-space-blue-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-blue-950/50 to-space-blue-950" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">发现最酷的</span>
              <br />
              <span className="text-white">AI 小项目</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              浏览、体验、分享来自全球开发者的创意 AI 作品
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/publish" className="btn-primary text-lg">
                <Sparkles className="w-5 h-5 inline mr-2" />
                发布你的项目
              </Link>
              <a href="#projects" className="btn-secondary text-lg">
                浏览项目
                <ChevronRight className="w-5 h-5 inline ml-1" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: '项目总数', value: '100+' },
              { label: '开发者', value: '50+' },
              { label: '本月浏览', value: '10K+' },
              { label: '互动次数', value: '5K+' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-4 text-center">
                <div className="font-display text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Topics */}
      {topics.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-electric-purple-400" />
                精选专题
              </h2>
              <Link to="#" className="text-neon-cyan-400 hover:text-neon-cyan-300 text-sm flex items-center gap-1">
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/topic/${topic.id}`}
                  className="group relative overflow-hidden rounded-2xl h-48 card-hover"
                >
                  <img
                    src={topic.coverImage}
                    alt={topic.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-blue-950 via-space-blue-950/60 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {topic.description}
                    </p>
                    <div className="text-neon-cyan-400 text-sm mt-2 flex items-center gap-1">
                      {topic.projectIds.length} 个项目
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section id="projects" className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Hot Ranking */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Hot Ranking */}
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neon-cyan-400" />
                    热度排行
                  </h3>
                  
                  {hotLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                          <div className="w-6 h-6 bg-white/10 rounded" />
                          <div className="flex-1">
                            <div className="h-4 bg-white/10 rounded w-3/4 mb-1" />
                            <div className="h-3 bg-white/10 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {hotProjects.slice(0, 5).map((project, index) => (
                        <Link
                          key={project.id}
                          to={`/project/${project.id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                : index === 1
                                ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                                : index === 2
                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                                : 'bg-white/10 text-gray-400'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate group-hover:text-neon-cyan-400 transition-colors">
                              {project.title}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {project.likesCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {project.viewsCount}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Categories */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      !selectedCategory
                        ? 'bg-gradient-to-r from-neon-cyan-500 to-electric-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    全部
                  </button>
                  {categories.map((category) => {
                    const IconComponent = categoryIcons[category.icon] || FileText;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedCategory === category.id.toString()
                            ? 'bg-gradient-to-r from-neon-cyan-500 to-electric-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">
                  {searchQuery ? `搜索: "${searchQuery}"` : '全部项目'}
                </h2>
                <div className="flex items-center gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        sortBy === option.value
                          ? 'bg-neon-cyan-500/20 text-neon-cyan-400 border border-neon-cyan-400/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Grid */}
              {loading && projects.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="glass-card overflow-hidden animate-pulse">
                      <div className="aspect-video bg-white/10" />
                      <div className="p-4 space-y-3">
                        <div className="h-6 bg-white/10 rounded w-3/4" />
                        <div className="h-4 bg-white/10 rounded w-full" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                        <div className="flex justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white/10 rounded-full" />
                            <div className="h-4 bg-white/10 rounded w-16" />
                          </div>
                          <div className="flex gap-2">
                            <div className="w-4 h-4 bg-white/10" />
                            <div className="w-4 h-4 bg-white/10" />
                            <div className="w-4 h-4 bg-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    没有找到相关项目
                  </h3>
                  <p className="text-gray-400">
                    试试其他关键词或分类吧
                  </p>
                </div>
              ) : (
                <>
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

                  {hasMore && (
                    <div className="text-center mt-12">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="btn-secondary px-8"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            加载中...
                          </span>
                        ) : (
                          '加载更多'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
