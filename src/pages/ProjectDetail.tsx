import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Eye,
  Bookmark,
  Share2,
  ExternalLink,
  Play,
  Clock,
  Github,
  Mail,
  MessageSquare,
  ThumbsUp,
  Flag,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { projectAPI } from '@/api/projects';
import { userAPI } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import type { Project, Comment } from '../../shared/types/index.js';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'other'>('bug');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabMessage, setCollabMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingCollab, setSubmittingCollab] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'changelog' | 'comments'>('details');

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
      loadComments(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      setLoading(true);
      const res = await projectAPI.getDetail(projectId);
      if (res.code === 200 && res.data) {
        setProject(res.data);
        if (res.data.categoryId) {
          loadRelatedProjects(res.data.categoryId, projectId);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (projectId: number) => {
    const res = await projectAPI.getComments(projectId);
    if (res.code === 200 && res.data) {
      setComments(res.data);
    }
  };

  const loadRelatedProjects = async (categoryId: number, excludeId: number) => {
    const res = await projectAPI.getList({ categoryId, pageSize: 6 });
    if (res.code === 200 && res.data) {
      setRelatedProjects(res.data.items.filter((p) => p.id !== excludeId).slice(0, 4));
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!project) return;
    const res = await projectAPI.like(project.id);
    if (res.code === 200 && res.data) {
      setProject({
        ...project,
        isLiked: res.data.liked,
        likesCount: res.data.liked ? project.likesCount + 1 : project.likesCount - 1,
      });
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!project) return;
    const res = await projectAPI.favorite(project.id);
    if (res.code === 200 && res.data) {
      setProject({
        ...project,
        isFavorited: res.data.favorited,
        favoritesCount: res.data.favorited ? project.favoritesCount + 1 : project.favoritesCount - 1,
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!commentText.trim() || !project) return;
    try {
      setSubmittingComment(true);
      const res = await projectAPI.addComment(project.id, commentText.trim());
      if (res.code === 200) {
        setCommentText('');
        loadComments(project.id);
        setProject({ ...project, commentsCount: project.commentsCount + 1 });
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!feedbackContent.trim() || !project) return;
    try {
      setSubmittingFeedback(true);
      const res = await projectAPI.submitFeedback(project.id, feedbackType, feedbackContent.trim());
      if (res.code === 200) {
        setFeedbackContent('');
        setShowFeedbackModal(false);
        alert('反馈提交成功！');
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleApplyCollab = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!project) return;
    try {
      setSubmittingCollab(true);
      const res = await projectAPI.applyCollab(project.id, collabMessage.trim());
      if (res.code === 200) {
        setCollabMessage('');
        setShowCollabModal(false);
        alert('协作申请已发送！');
      }
    } finally {
      setSubmittingCollab(false);
    }
  };

  const handleRelatedLike = async (projectId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await projectAPI.like(projectId);
    if (res.code === 200 && res.data) {
      setRelatedProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                isLiked: res.data!.liked,
                likesCount: res.data!.liked ? p.likesCount + 1 : p.likesCount - 1,
              }
            : p
        )
      );
    }
  };

  const handleRelatedFavorite = async (projectId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await projectAPI.favorite(projectId);
    if (res.code === 200 && res.data) {
      setRelatedProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                isFavorited: res.data!.favorited,
                favoritesCount: res.data!.favorited ? p.favoritesCount + 1 : p.favoritesCount - 1,
              }
            : p
        )
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板！');
    }
  };

  const nextScreenshot = () => {
    if (!project) return;
    setActiveScreenshot((prev) => (prev + 1) % project.screenshots.length);
  };

  const prevScreenshot = () => {
    if (!project) return;
    setActiveScreenshot((prev) => (prev - 1 + project.screenshots.length) % project.screenshots.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-blue-950">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white/10 rounded w-1/2" />
            <div className="h-8 bg-white/10 rounded w-1/4" />
            <div className="aspect-video bg-white/10 rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-32 bg-white/10 rounded" />
              <div className="h-32 bg-white/10 rounded" />
              <div className="h-32 bg-white/10 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-space-blue-950">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">项目不存在</h2>
          <p className="text-gray-400 mb-6">该项目可能已被删除或不存在</p>
          <Link to="/" className="btn-primary">
            返回首页
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-blue-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan-400 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            返回项目列表
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {project.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-electric-purple-500/20 text-electric-purple-400 border border-electric-purple-400/30">
                    <Sparkles className="w-4 h-4 mr-1" />
                    精选
                  </span>
                )}
                {project.isBroken && (
                  <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-coral-red-500/20 text-coral-red-400 border border-coral-red-400/30">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    链接失效
                  </span>
                )}
                {!project.isFree && (
                  <span className="px-3 py-1 text-sm font-medium rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                    付费
                  </span>
                )}
                {project.category && (
                  <span className="tag">{project.category.name}</span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                {project.title}
              </h1>
              <p className="text-gray-400 text-lg max-w-3xl">
                {project.description}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-400">
              <Eye className="w-5 h-5 text-neon-cyan-400" />
              <span>{project.viewsCount} 浏览</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Heart className="w-5 h-5 text-coral-red-400" />
              <span>{project.likesCount} 点赞</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Bookmark className="w-5 h-5 text-neon-cyan-400" />
              <span>{project.favoritesCount} 收藏</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MessageSquare className="w-5 h-5 text-electric-purple-400" />
              <span>{project.commentsCount} 评论</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>更新于 {new Date(project.updatedAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={project.experienceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              立即体验
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={handleLike}
              className={`btn-secondary flex items-center gap-2 ${
                project.isLiked ? 'border-coral-red-400 text-coral-red-400' : ''
              }`}
            >
              <Heart className={`w-5 h-5 ${project.isLiked ? 'fill-current' : ''}`} />
              {project.isLiked ? '已点赞' : '点赞'}
            </button>
            <button
              onClick={handleFavorite}
              className={`btn-secondary flex items-center gap-2 ${
                project.isFavorited ? 'border-neon-cyan-400 text-neon-cyan-400' : ''
              }`}
            >
              <Bookmark className={`w-5 h-5 ${project.isFavorited ? 'fill-current' : ''}`} />
              {project.isFavorited ? '已收藏' : '收藏'}
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              分享
            </button>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Flag className="w-5 h-5" />
              反馈
            </button>
            <button
              onClick={() => setShowCollabModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              申请协作
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Screenshots Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <div className="glass-card p-6 mb-8">
                  <h2 className="font-display text-xl font-bold text-white mb-4">演示截图</h2>
                  <div className="relative">
                    <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
                      <img
                        src={project.screenshots[activeScreenshot]}
                        alt={`${project.title} 截图 ${activeScreenshot + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {project.screenshots.length > 1 && (
                      <>
                        <button
                          onClick={prevScreenshot}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextScreenshot}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="flex justify-center gap-2 mt-4">
                          {project.screenshots.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveScreenshot(index)}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index === activeScreenshot
                                  ? 'bg-neon-cyan-400 w-8'
                                  : 'bg-white/20 hover:bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
                  {[
                    { value: 'details', label: '项目详情' },
                    { value: 'changelog', label: '更新日志' },
                    { value: 'comments', label: `评论 (${project.commentsCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.value
                          ? 'bg-neon-cyan-500/20 text-neon-cyan-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Project Description */}
                  <div className="glass-card p-6">
                    <h2 className="font-display text-xl font-bold text-white mb-4">项目介绍</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="glass-card p-6">
                      <h2 className="font-display text-xl font-bold text-white mb-4">标签</h2>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-full bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="glass-card p-6">
                      <h2 className="font-display text-xl font-bold text-white mb-4">技术栈</h2>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-lg bg-neon-cyan-500/10 text-neon-cyan-400 text-sm border border-neon-cyan-400/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Usage Limit */}
                  {project.usageLimit && (
                    <div className="glass-card p-6">
                      <h2 className="font-display text-xl font-bold text-white mb-4">使用限制</h2>
                      <p className="text-gray-300">{project.usageLimit}</p>
                    </div>
                  )}

                  {/* Links */}
                  <div className="glass-card p-6">
                    <h2 className="font-display text-xl font-bold text-white mb-4">相关链接</h2>
                    <div className="space-y-3">
                      <a
                        href={project.experienceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-neon-cyan-500/20">
                          <Play className="w-5 h-5 text-neon-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">在线体验</div>
                          <div className="text-sm text-gray-400 truncate">{project.experienceUrl}</div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      </a>
                      {project.openSourceUrl && (
                        <a
                          href={project.openSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-electric-purple-500/20">
                            <Github className="w-5 h-5 text-electric-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">开源仓库</div>
                            <div className="text-sm text-gray-400 truncate">{project.openSourceUrl}</div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* License */}
                  {project.license && (
                    <div className="glass-card p-6">
                      <h2 className="font-display text-xl font-bold text-white mb-4">开源协议</h2>
                      <span className="inline-block px-4 py-2 rounded-lg bg-jade-green-500/20 text-jade-green-400 border border-jade-green-400/30">
                        {project.license}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'changelog' && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-xl font-bold text-white mb-6">更新日志</h2>
                  {project.changelog && project.changelog.length > 0 ? (
                    <div className="space-y-6">
                      {project.changelog.map((entry, index) => (
                        <div key={index} className="relative pl-8 pb-6 border-l-2 border-white/10 last:border-0 last:pb-0">
                          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-neon-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-display font-bold text-white">v{entry.version}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-gray-300">{entry.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">暂无更新日志</p>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="glass-card p-6">
                  <h2 className="font-display text-xl font-bold text-white mb-6">
                    评论 ({comments.length})
                  </h2>

                  {/* Comment Input */}
                  {isAuthenticated ? (
                    <div className="flex gap-3 mb-6">
                      <img
                        src={user?.avatar}
                        alt={user?.username}
                        className="w-10 h-10 rounded-full border border-white/20"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="写下你的评论..."
                          className="input-field min-h-[100px] resize-none mb-3"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim() || submittingComment}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                          >
                            {submittingComment ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                            发表评论
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 mb-6 bg-white/5 rounded-xl">
                      <p className="text-gray-400 mb-3">登录后即可发表评论</p>
                      <Link to="/login" className="btn-primary">
                        立即登录
                      </Link>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-white/5">
                          <img
                            src={comment.user.avatar}
                            alt={comment.user.username}
                            className="w-10 h-10 rounded-full border border-white/20"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Link
                                to={`/author/${comment.user.id}`}
                                className="font-medium text-white hover:text-neon-cyan-400 transition-colors"
                              >
                                {comment.user.username}
                              </Link>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-gray-300 mb-2">{comment.content}</p>
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-coral-red-400 transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{comment.likesCount}</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-8">暂无评论，快来抢沙发吧！</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Author Card */}
                {project.author && (
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-bold text-white mb-4">作者信息</h3>
                    <Link
                      to={`/author/${project.author.id}`}
                      className="flex items-center gap-3 mb-4 group"
                    >
                      <img
                        src={project.author.avatar}
                        alt={project.author.username}
                        className="w-14 h-14 rounded-full border-2 border-white/20 group-hover:border-neon-cyan-400 transition-colors"
                      />
                      <div>
                        <div className="font-medium text-white group-hover:text-neon-cyan-400 transition-colors">
                          {project.author.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.author.role === 'admin'
                            ? '管理员'
                            : project.author.role === 'creator'
                            ? '创作者'
                            : '用户'}
                        </div>
                      </div>
                    </Link>
                    {project.author.bio && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.author.bio}</p>
                    )}
                    <div className="flex gap-2 text-sm text-gray-500 mb-4">
                      <span>{project.author.followersCount} 粉丝</span>
                      <span>·</span>
                      <span>{project.author.followingCount} 关注</span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${project.author.email}`}
                        className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        联系
                      </a>
                      <button className="flex-1 btn-primary text-sm">关注</button>
                    </div>
                  </div>
                )}

                {/* Collaborators */}
                {project.collaborators && project.collaborators.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-neon-cyan-400" />
                      协作者
                    </h3>
                    <div className="space-y-3">
                      {project.collaborators.map((collab) => (
                        <Link
                          key={collab.id}
                          to={`/author/${collab.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <img
                            src={collab.avatar}
                            alt={collab.username}
                            className="w-8 h-8 rounded-full border border-white/20 group-hover:border-neon-cyan-400 transition-colors"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-neon-cyan-400 transition-colors">
                            {collab.username}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-white mb-6">相关项目</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {relatedProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onLike={() => handleRelatedLike(p.id)}
                  onFavorite={() => handleRelatedFavorite(p.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-display text-xl font-bold text-white mb-4">提交反馈</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">反馈类型</label>
                <div className="flex gap-2">
                  {[
                    { value: 'bug', label: 'Bug 反馈' },
                    { value: 'suggestion', label: '功能建议' },
                    { value: 'other', label: '其他' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFeedbackType(type.value as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        feedbackType === type.value
                          ? 'bg-neon-cyan-500/20 text-neon-cyan-400 border border-neon-cyan-400/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">反馈内容</label>
                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="请详细描述您的反馈..."
                  className="input-field min-h-[120px] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackContent.trim() || submittingFeedback}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submittingFeedback ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    提交中...
                  </span>
                ) : (
                  '提交反馈'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collab Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-display text-xl font-bold text-white mb-4">申请加入协作</h3>
            <p className="text-gray-400 mb-4">
              向项目作者发送协作申请，介绍一下您的技能和能为项目带来什么。
            </p>
            <div>
              <label className="block text-sm text-gray-400 mb-2">自我介绍（可选）</label>
              <textarea
                value={collabMessage}
                onChange={(e) => setCollabMessage(e.target.value)}
                placeholder="介绍一下您的背景、技能和想参与的方向..."
                className="input-field min-h-[120px] resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCollabModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleApplyCollab}
                disabled={submittingCollab}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {submittingCollab ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    发送中...
                  </span>
                ) : (
                  '发送申请'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
