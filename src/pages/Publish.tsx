import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  Plus,
  ChevronLeft,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  FileText,
  Settings,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { categoryAPI } from '@/api/categories';
import { projectAPI } from '@/api/projects';
import { useAuthStore } from '@/store/authStore';
import type { Category, ChangelogEntry } from '../../shared/types/index.js';

const techStackOptions = [
  'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js', 'Node.js', 'Python',
  'TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'LangChain',
  'TypeScript', 'JavaScript', 'Go', 'Rust', 'Java', 'C++',
  'Tailwind CSS', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'
];

export default function Publish() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: 1,
    tags: [] as string[],
    tagInput: '',
    experienceUrl: '',
    experienceType: 'external' as 'iframe' | 'external',
    isFree: true,
    usageLimit: '',
    techStack: [] as string[],
    openSourceUrl: '',
    license: 'MIT',
    coverImage: '',
    screenshots: [] as string[],
    changelog: [
      { version: '1.0.0', date: new Date().toISOString().split('T')[0], description: '初始版本发布' }
    ] as ChangelogEntry[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCategories();
  }, [isAuthenticated, navigate]);

  const loadCategories = async () => {
    const res = await categoryAPI.getAll();
    if (res.code === 200 && res.data) {
      setCategories(res.data);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTechStackToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const handleAddChangelog = () => {
    setFormData((prev) => ({
      ...prev,
      changelog: [
        ...prev.changelog,
        { version: '', date: new Date().toISOString().split('T')[0], description: '' },
      ],
    }));
  };

  const handleRemoveChangelog = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      changelog: prev.changelog.filter((_, i) => i !== index),
    }));
  };

  const handleChangelogChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      changelog: prev.changelog.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const handleCoverUpload = () => {
    const imageUrl = prompt('请输入封面图片链接：', 'https://picsum.photos/800/450');
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
    }
  };

  const handleScreenshotUpload = () => {
    const imageUrl = prompt('请输入截图链接：', 'https://picsum.photos/800/450');
    if (imageUrl && formData.screenshots.length < 5) {
      setFormData((prev) => ({
        ...prev,
        screenshots: [...prev.screenshots, imageUrl],
      }));
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = '请输入项目标题';
      if (!formData.description.trim()) newErrors.description = '请输入项目描述';
      if (!formData.categoryId) newErrors.categoryId = '请选择分类';
      if (formData.tags.length === 0) newErrors.tags = '请至少添加一个标签';
    }

    if (currentStep === 2) {
      if (!formData.experienceUrl.trim()) newErrors.experienceUrl = '请输入体验链接';
      if (!formData.coverImage.trim()) newErrors.coverImage = '请上传封面图片';
      if (formData.screenshots.length === 0) newErrors.screenshots = '请至少上传一张截图';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step) && step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      const res = await projectAPI.create({
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        tags: formData.tags,
        experienceUrl: formData.experienceUrl,
        experienceType: formData.experienceType,
        isFree: formData.isFree,
        usageLimit: formData.usageLimit,
        techStack: formData.techStack,
        openSourceUrl: formData.openSourceUrl,
        license: formData.license,
        coverImage: formData.coverImage,
        screenshots: formData.screenshots,
        changelog: formData.changelog,
      });

      if (res.code === 200 && res.data) {
        alert('项目提交成功！等待审核通过后即可展示。');
        navigate(`/project/${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.message || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: '基本信息', icon: FileText },
    { num: 2, title: '演示材料', icon: ImageIcon },
    { num: 3, title: '高级设置', icon: Settings },
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

          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="gradient-text">发布你的 AI 项目</span>
            </h1>
            <p className="text-gray-400">
              分享你的创意，让更多人体验你的作品
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step > s.num
                        ? 'bg-jade-green-500 text-white'
                        : step === s.num
                        ? 'bg-gradient-to-r from-neon-cyan-500 to-electric-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {step > s.num ? '✓' : <s.icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      step >= s.num ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 md:w-32 h-1 mx-2 rounded-full transition-all ${
                      step > s.num ? 'bg-jade-green-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="glass-card p-6 md:p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    项目标题 <span className="text-coral-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="给你的项目起个响亮的名字"
                    className={`input-field ${errors.title ? 'border-coral-red-400' : ''}`}
                    maxLength={50}
                  />
                  {errors.title && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    项目描述 <span className="text-coral-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="详细介绍你的项目功能、特点和使用场景..."
                    className={`input-field min-h-[150px] resize-none ${errors.description ? 'border-coral-red-400' : ''}`}
                    maxLength={1000}
                  />
                  <p className="text-gray-500 text-sm mt-1 text-right">
                    {formData.description.length}/1000
                  </p>
                  {errors.description && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    分类 <span className="text-coral-red-400">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`input-field ${errors.categoryId ? 'border-coral-red-400' : ''}`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    标签 <span className="text-coral-red-400">*</span>
                    <span className="text-gray-500 font-normal text-sm">（最多5个）</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      name="tagInput"
                      value={formData.tagInput}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tagInput: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="输入标签后按回车添加"
                      className="input-field flex-1"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={formData.tags.length >= 5}
                      className="btn-primary px-4 disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-cyan-500/20 text-neon-cyan-400 text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {errors.tags && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.tags}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button onClick={handleNext} className="btn-primary px-8">
                    下一步
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Demo Materials */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    体验链接 <span className="text-coral-red-400">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="experienceType"
                          value="external"
                          checked={formData.experienceType === 'external'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-neon-cyan-400"
                        />
                        <span className="text-sm text-gray-300">外部链接</span>
                      </label>
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="experienceType"
                          value="iframe"
                          checked={formData.experienceType === 'iframe'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-neon-cyan-400"
                        />
                        <span className="text-sm text-gray-300">内嵌 iframe</span>
                      </label>
                    </div>
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="url"
                      name="experienceUrl"
                      value={formData.experienceUrl}
                      onChange={handleInputChange}
                      placeholder="https://your-project-demo.com"
                      className={`input-field pl-12 ${errors.experienceUrl ? 'border-coral-red-400' : ''}`}
                    />
                  </div>
                  {errors.experienceUrl && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.experienceUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    封面图片 <span className="text-coral-red-400">*</span>
                  </label>
                  {formData.coverImage ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video">
                      <img
                        src={formData.coverImage}
                        alt="封面"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleCoverUpload}
                      className={`w-full aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-neon-cyan-400 transition-colors flex flex-col items-center justify-center gap-3 ${errors.coverImage ? 'border-coral-red-400' : ''}`}
                    >
                      <Upload className="w-10 h-10 text-gray-500" />
                      <span className="text-gray-400">点击上传封面图片</span>
                      <span className="text-sm text-gray-500">建议尺寸 800×450</span>
                    </button>
                  )}
                  {errors.coverImage && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.coverImage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    演示截图 <span className="text-coral-red-400">*</span>
                    <span className="text-gray-500 font-normal text-sm ml-2">（最多5张）</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden aspect-video">
                        <img
                          src={screenshot}
                          alt={`截图 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveScreenshot(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.screenshots.length < 5 && (
                      <button
                        onClick={handleScreenshotUpload}
                        className="aspect-video rounded-lg border-2 border-dashed border-white/20 hover:border-neon-cyan-400 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Plus className="w-8 h-8 text-gray-500" />
                        <span className="text-xs text-gray-500">添加截图</span>
                      </button>
                    )}
                  </div>
                  {errors.screenshots && (
                    <p className="text-coral-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.screenshots}
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button onClick={handlePrev} className="btn-secondary px-8">
                    上一步
                  </button>
                  <button onClick={handleNext} className="btn-primary px-8">
                    下一步
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Advanced Settings */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    收费模式
                  </label>
                  <div className="flex gap-4">
                    <label className="flex-1 inline-flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white/5">
                      <input
                        type="radio"
                        name="isFree"
                        checked={formData.isFree}
                        onChange={() => setFormData((prev) => ({ ...prev, isFree: true }))}
                        className="w-4 h-4 accent-jade-green-400"
                      />
                      <div>
                        <div className="text-white font-medium">免费</div>
                        <div className="text-sm text-gray-500">所有用户可免费使用</div>
                      </div>
                    </label>
                    <label className="flex-1 inline-flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white/5">
                      <input
                        type="radio"
                        name="isFree"
                        checked={!formData.isFree}
                        onChange={() => setFormData((prev) => ({ ...prev, isFree: false }))}
                        className="w-4 h-4 accent-yellow-400"
                      />
                      <div>
                        <div className="text-white font-medium">付费</div>
                        <div className="text-sm text-gray-500">部分功能需要付费</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    使用限制说明
                  </label>
                  <textarea
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="说明使用限制，如每日调用次数、API 配额等..."
                    className="input-field min-h-[100px] resize-none"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    技术栈
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {techStackOptions.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleTechStackToggle(tech)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          formData.techStack.includes(tech)
                            ? 'bg-neon-cyan-500/20 text-neon-cyan-400 border border-neon-cyan-400/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      开源仓库地址（可选）
                    </label>
                    <input
                      type="url"
                      name="openSourceUrl"
                      value={formData.openSourceUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/your/repo"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      开源协议
                    </label>
                    <select
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="MIT">MIT License</option>
                      <option value="Apache-2.0">Apache License 2.0</option>
                      <option value="GPL-3.0">GNU GPLv3</option>
                      <option value="BSD-3-Clause">BSD 3-Clause</option>
                      <option value="Proprietary">Proprietary（闭源）</option>
                      <option value="Other">其他</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2 flex items-center justify-between">
                    <span>更新日志</span>
                    <button
                      type="button"
                      onClick={handleAddChangelog}
                      className="text-neon-cyan-400 hover:text-neon-cyan-300 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      添加版本
                    </button>
                  </label>
                  <div className="space-y-3">
                    {formData.changelog.map((entry, index) => (
                      <div key={index} className="flex gap-3 p-4 rounded-xl bg-white/5">
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={entry.version}
                              onChange={(e) => handleChangelogChange(index, 'version', e.target.value)}
                              placeholder="版本号 (如 1.0.0)"
                              className="input-field flex-1 text-sm"
                            />
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(e) => handleChangelogChange(index, 'date', e.target.value)}
                              className="input-field text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            value={entry.description}
                            onChange={(e) => handleChangelogChange(index, 'description', e.target.value)}
                            placeholder="版本更新说明..."
                            className="input-field text-sm"
                          />
                        </div>
                        {formData.changelog.length > 1 && (
                          <button
                            onClick={() => handleRemoveChangelog(index)}
                            className="text-gray-500 hover:text-coral-red-400 transition-colors self-start mt-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={handlePrev} className="btn-secondary px-8">
                    上一步
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary px-8 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        提交发布
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
