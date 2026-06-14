import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Eye,
  Heart,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  Loader2,
  Eye as EyeIcon,
  Check,
  X,
  AlertTriangle as AlertTriangleIcon,
  Star,
  StarOff,
  Plus,
  Pencil,
  Trash2,
  Save,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { adminAPI } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';
import type { Project } from '../../shared/types/index.js';

type TabType = 'overview' | 'pending' | 'all' | 'topics' | 'broken';

interface TopicFormData {
  title: string;
  description: string;
  coverImage: string;
  projectIds: number[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    pending: true,
    all: true,
    topics: true,
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [topicFormLoading, setTopicFormLoading] = useState(false);
  const [topicForm, setTopicForm] = useState<TopicFormData>({
    title: '',
    description: '',
    coverImage: '',
    projectIds: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAllData();
  }, [isAuthenticated, navigate, user]);

  const loadAllData = async () => {
    loadStats();
    loadPendingProjects();
    loadAllProjects();
    loadTopics();
  };

  const loadStats = async () => {
    try {
      const res = await adminAPI.getStats();
      if (res.code === 200 && res.data) {
        setStats(res.data);
      }
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  const loadPendingProjects = async () => {
    try {
      const res = await adminAPI.getPendingProjects({ pageSize: 20 });
      if (res.code === 200 && res.data) {
        setPendingProjects(res.data.items);
      }
    } finally {
      setLoading((prev) => ({ ...prev, pending: false }));
    }
  };

  const loadAllProjects = async () => {
    try {
      const res = await adminAPI.getAllProjects({ pageSize: 50 });
      if (res.code === 200 && res.data) {
        setAllProjects(res.data.items);
      }
    } finally {
      setLoading((prev) => ({ ...prev, all: false }));
    }
  };

  const loadTopics = async () => {
    try {
      const res = await adminAPI.getTopics();
      if (res.code === 200 && res.data) {
        setTopics(res.data);
      }
    } finally {
      setLoading((prev) => ({ ...prev, topics: false }));
    }
  };

  const handleApprove = async (projectId: number) => {
    if (!confirm('确定通过该项目的审核吗？')) return;
    try {
      setActionLoading(projectId);
      const res = await adminAPI.approveProject(projectId);
      if (res.code === 200) {
        alert('项目已通过审核！');
        loadPendingProjects();
        loadAllProjects();
        loadStats();
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (projectId: number) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason === null) return;
    try {
      setActionLoading(projectId);
      const res = await adminAPI.rejectProject(projectId, reason);
      if (res.code === 200) {
        alert('项目已拒绝！');
        loadPendingProjects();
        loadAllProjects();
        loadStats();
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (projectId: number, isFeatured: boolean) => {
    try {
      setActionLoading(projectId);
      const res = await adminAPI.setFeatured(projectId, !isFeatured);
      if (res.code === 200) {
        alert(!isFeatured ? '已设为精选！' : '已取消精选！');
        loadAllProjects();
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBroken = async (projectId: number, isBroken: boolean) => {
    try {
      setActionLoading(projectId);
      const res = await adminAPI.markBroken(projectId, !isBroken);
      if (res.code === 200) {
        alert(!isBroken ? '已标记为失效！' : '已取消失效标记！');
        loadAllProjects();
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCreateTopic = () => {
    setEditingTopicId(null);
    setTopicForm({
      title: '',
      description: '',
      coverImage: '',
      projectIds: [],
    });
    setShowTopicModal(true);
  };

  const handleOpenEditTopic = (topic: any) => {
    setEditingTopicId(topic.id);
    setTopicForm({
      title: topic.title || '',
      description: topic.description || '',
      coverImage: topic.coverImage || '',
      projectIds: topic.projectIds || [],
    });
    setShowTopicModal(true);
  };

  const handleCloseTopicModal = () => {
    setShowTopicModal(false);
    setEditingTopicId(null);
  };

  const handleTopicFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTopicForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleProjectInTopic = (projectId: number) => {
    setTopicForm((prev) => {
      const exists = prev.projectIds.includes(projectId);
      return {
        ...prev,
        projectIds: exists
          ? prev.projectIds.filter((id) => id !== projectId)
          : [...prev.projectIds, projectId],
      };
    });
  };

  const handleSaveTopic = async () => {
    if (!topicForm.title.trim()) {
      alert('请输入专题标题');
      return;
    }
    try {
      setTopicFormLoading(true);
      if (editingTopicId) {
        const res = await adminAPI.updateTopic(editingTopicId, topicForm);
        if (res.code === 200) {
          alert('专题更新成功！');
          handleCloseTopicModal();
          loadTopics();
        }
      } else {
        const res = await adminAPI.createTopic(topicForm);
        if (res.code === 200) {
          alert('专题创建成功！');
          handleCloseTopicModal();
          loadTopics();
        }
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setTopicFormLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId: number, title: string) => {
    if (!confirm(`确定要删除专题「${title}」吗？此操作不可恢复。`)) return;
    try {
      setActionLoading(topicId);
      const res = await adminAPI.deleteTopic(topicId);
      if (res.code === 200) {
        alert('专题已删除！');
        loadTopics();
      }
    } catch (err: any) {
      alert(err.message || '删除失败');
    } finally {
      setActionLoading(null);
    }
  };

  const approvedProjects = allProjects.filter((p) => p.status === 'approved');

  const tabs = [
    { id: 'overview', label: '数据概览', icon: LayoutDashboard },
    { id: 'pending', label: '待审核', icon: FileText, badge: pendingProjects.length },
    { id: 'all', label: '全部项目', icon: Eye },
    { id: 'topics', label: '专题管理', icon: Sparkles },
    { id: 'broken', label: '失效链接', icon: AlertTriangle },
  ];

  const brokenProjects = allProjects.filter((p) => p.isBroken);

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-white mb-1">
                管理后台
              </h1>
              <p className="text-gray-400">平台数据管理与内容审核</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="status-badge status-error">管理员</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-neon-cyan-500/20 text-neon-cyan-400 border border-neon-cyan-400/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-coral-red-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading.stats ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
                      <div className="h-10 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-white/10 rounded w-1/3" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="glass-card p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-neon-cyan-500/20">
                          <Users className="w-6 h-6 text-neon-cyan-400" />
                        </div>
                        <span className="text-gray-400">总用户数</span>
                      </div>
                      <div className="font-display text-3xl font-bold gradient-text mb-1">
                        {stats?.totalUsers || 0}
                      </div>
                      <div className="text-sm text-jade-green-400">
                        +{stats?.todayNewUsers || 0} 今日新增
                      </div>
                    </div>
                    <div className="glass-card p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-electric-purple-500/20">
                          <FileText className="w-6 h-6 text-electric-purple-400" />
                        </div>
                        <span className="text-gray-400">总项目数</span>
                      </div>
                      <div className="font-display text-3xl font-bold gradient-text mb-1">
                        {stats?.totalProjects || 0}
                      </div>
                      <div className="text-sm text-jade-green-400">
                        +{stats?.todayNewProjects || 0} 今日新增
                      </div>
                    </div>
                    <div className="glass-card p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-coral-red-500/20">
                          <Heart className="w-6 h-6 text-coral-red-400" />
                        </div>
                        <span className="text-gray-400">总点赞数</span>
                      </div>
                      <div className="font-display text-3xl font-bold gradient-text mb-1">
                        {stats?.totalLikes || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stats?.pendingProjects || 0} 个待审核
                      </div>
                    </div>
                    <div className="glass-card p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-jade-green-500/20">
                          <Eye className="w-6 h-6 text-jade-green-400" />
                        </div>
                        <span className="text-gray-400">总浏览量</span>
                      </div>
                      <div className="font-display text-3xl font-bold gradient-text mb-1">
                        {stats?.totalViews || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        平台累计访问
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Recent Pending */}
              <div className="glass-card p-6">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon-cyan-400" />
                  待审核项目
                </h2>
                {loading.pending ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
                        <div className="w-16 h-16 bg-white/10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-white/10 rounded w-1/3" />
                          <div className="h-4 bg-white/10 rounded w-1/2" />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-20 h-10 bg-white/10 rounded-lg" />
                          <div className="w-20 h-10 bg-white/10 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingProjects.length > 0 ? (
                  <div className="space-y-4">
                    {pendingProjects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{project.title}</h3>
                          <p className="text-sm text-gray-400 truncate">{project.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(project.id)}
                            disabled={actionLoading === project.id}
                            className="px-4 py-2 rounded-lg bg-jade-green-500/20 text-jade-green-400 hover:bg-jade-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === project.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            通过
                          </button>
                          <button
                            onClick={() => handleReject(project.id)}
                            disabled={actionLoading === project.id}
                            className="px-4 py-2 rounded-lg bg-coral-red-500/20 text-coral-red-400 hover:bg-coral-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {actionLoading === project.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            拒绝
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-jade-green-400 mx-auto mb-3" />
                    <p className="text-gray-400">暂无待审核项目</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6">待审核项目</h2>
              {loading.pending ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
                      <div className="w-20 h-20 bg-white/10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-white/10 rounded w-1/3" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-24 h-10 bg-white/10 rounded-lg" />
                        <div className="w-24 h-10 bg-white/10 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingProjects.length > 0 ? (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white/5">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{project.title}</h3>
                          <span className="status-badge status-warning">待审核</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {project.viewsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {project.likesCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(project.id)}
                          disabled={actionLoading === project.id}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-jade-green-500/20 text-jade-green-400 hover:bg-jade-green-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === project.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          通过
                        </button>
                        <button
                          onClick={() => handleReject(project.id)}
                          disabled={actionLoading === project.id}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-coral-red-500/20 text-coral-red-400 hover:bg-coral-red-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === project.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          拒绝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-jade-green-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    太棒了！
                  </h3>
                  <p className="text-gray-400">所有项目都已审核完成</p>
                </div>
              )}
            </div>
          )}

          {/* All Projects Tab */}
          {activeTab === 'all' && (
            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6">全部项目</h2>
              {loading.all ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
                      <div className="w-16 h-16 bg-white/10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-white/10 rounded w-1/3" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 bg-white/10 rounded-lg" />
                        <div className="w-10 h-10 bg-white/10 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                        <th className="pb-4 font-medium">项目</th>
                        <th className="pb-4 font-medium">状态</th>
                        <th className="pb-4 font-medium">浏览</th>
                        <th className="pb-4 font-medium">点赞</th>
                        <th className="pb-4 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allProjects.map((project) => (
                        <tr key={project.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <div className="font-medium text-white">{project.title}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {project.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`status-badge ${
                              project.status === 'approved' ? 'status-success' :
                              project.status === 'pending' ? 'status-warning' : 'status-error'
                            }`}>
                              {project.status === 'approved' ? '已通过' :
                               project.status === 'pending' ? '待审核' : '已拒绝'}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400">{project.viewsCount}</td>
                          <td className="py-4 text-gray-400">{project.likesCount}</td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleFeatured(project.id, project.isFeatured)}
                                disabled={actionLoading === project.id}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                  project.isFeatured
                                    ? 'bg-electric-purple-500/20 text-electric-purple-400'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                                title={project.isFeatured ? '取消精选' : '设为精选'}
                              >
                                {project.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleToggleBroken(project.id, project.isBroken)}
                                disabled={actionLoading === project.id}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                  project.isBroken
                                    ? 'bg-coral-red-500/20 text-coral-red-400'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                                title={project.isBroken ? '取消失效' : '标记失效'}
                              >
                                <AlertTriangleIcon className="w-4 h-4" />
                              </button>
                              {project.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(project.id)}
                                    disabled={actionLoading === project.id}
                                    className="p-2 rounded-lg bg-jade-green-500/20 text-jade-green-400 hover:bg-jade-green-500/30 transition-colors disabled:opacity-50"
                                    title="通过"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(project.id)}
                                    disabled={actionLoading === project.id}
                                    className="p-2 rounded-lg bg-coral-red-500/20 text-coral-red-400 hover:bg-coral-red-500/30 transition-colors disabled:opacity-50"
                                    title="拒绝"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400">暂无项目</p>
                </div>
              )}
            </div>
          )}

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">专题管理</h2>
                <button
                  onClick={handleOpenCreateTopic}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  新建专题
                </button>
              </div>
              {loading.topics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="aspect-video bg-white/10 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {topics.map((topic) => (
                    <div key={topic.id} className="relative overflow-hidden rounded-2xl group">
                      <img
                        src={topic.coverImage}
                        alt={topic.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-space-blue-950 via-space-blue-950/60 to-transparent" />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h3 className="font-display text-lg font-bold text-white mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                          {topic.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-neon-cyan-400 text-sm">
                            {topic.projectIds?.length || 0} 个项目
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditTopic(topic)}
                              disabled={actionLoading === topic.id}
                              className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteTopic(topic.id, topic.title)}
                              disabled={actionLoading === topic.id}
                              className="px-3 py-1.5 rounded-lg bg-coral-red-500/20 text-coral-red-400 text-sm hover:bg-coral-red-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {actionLoading === topic.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Sparkles className="w-12 h-12 text-electric-purple-400 mx-auto mb-3" />
                  <p className="text-gray-400">暂无专题，点击上方按钮创建第一个专题</p>
                </div>
              )}
            </div>
          )}

          {/* Topic Form Modal */}
          {showTopicModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-white">
                    {editingTopicId ? '编辑专题' : '新建专题'}
                  </h3>
                  <button
                    onClick={handleCloseTopicModal}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      专题标题 <span className="text-coral-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={topicForm.title}
                      onChange={handleTopicFormChange}
                      placeholder="输入专题标题"
                      className="input-field"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      专题描述
                    </label>
                    <textarea
                      name="description"
                      value={topicForm.description}
                      onChange={handleTopicFormChange}
                      placeholder="输入专题描述"
                      className="input-field min-h-[100px] resize-none"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      封面图片 URL
                    </label>
                    <input
                      type="text"
                      name="coverImage"
                      value={topicForm.coverImage}
                      onChange={handleTopicFormChange}
                      placeholder="输入封面图片链接，留空将使用默认封面"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      收录项目
                      <span className="text-gray-400 font-normal ml-2">
                        (已选 {topicForm.projectIds.length} 个)
                      </span>
                    </label>
                    {loading.all ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : approvedProjects.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border border-white/10 rounded-xl p-3">
                        {approvedProjects.map((project) => (
                          <label
                            key={project.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              topicForm.projectIds.includes(project.id)
                                ? 'bg-neon-cyan-500/10 border border-neon-cyan-400/30'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={topicForm.projectIds.includes(project.id)}
                              onChange={() => handleToggleProjectInTopic(project.id)}
                              className="w-4 h-4 rounded accent-neon-cyan-400"
                            />
                            <img
                              src={project.coverImage}
                              alt={project.title}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">
                                {project.title}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {project.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm bg-white/5 rounded-xl">
                        暂无已审核通过的项目
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleCloseTopicModal}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveTopic}
                    disabled={topicFormLoading}
                    className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {topicFormLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingTopicId ? '保存修改' : '创建专题'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Broken Links Tab */}
          {activeTab === 'broken' && (
            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral-red-400" />
                失效链接
              </h2>
              {loading.all ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
                      <div className="w-16 h-16 bg-white/10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-white/10 rounded w-1/3" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                      </div>
                      <div className="w-24 h-10 bg-white/10 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : brokenProjects.length > 0 ? (
                <div className="space-y-4">
                  {brokenProjects.map((project) => (
                    <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-coral-red-500/10 border border-coral-red-400/30">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{project.title}</h3>
                          <span className="status-badge status-error">已失效</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">{project.description}</p>
                        <a
                          href={project.experienceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-neon-cyan-400 hover:text-neon-cyan-300 truncate block"
                        >
                          {project.experienceUrl}
                        </a>
                      </div>
                      <button
                        onClick={() => handleToggleBroken(project.id, true)}
                        disabled={actionLoading === project.id}
                        className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
                      >
                        {actionLoading === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        标记正常
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 text-jade-green-400 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-white mb-2">
                    太好了！
                  </h3>
                  <p className="text-gray-400">所有项目链接都正常工作</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
