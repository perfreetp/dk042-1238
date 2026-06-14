import { Link } from 'react-router-dom';
import { Sparkles, Github, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan-400 to-electric-purple-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold gradient-text">
                AI 项目广场
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              发现、体验、分享最酷的 AI 小项目。为开发者、学生和创业团队提供展示平台，让更多人看到你的创意。
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-cyan-400 hover:border-neon-cyan-400/50 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:contact@aiplaza.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-cyan-400 hover:border-neon-cyan-400/50 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  项目广场
                </Link>
              </li>
              <li>
                <Link to="/publish" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  发布项目
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  我的收藏
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">分类浏览</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/?category=1" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  文本生成
                </Link>
              </li>
              <li>
                <Link to="/?category=2" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  图像处理
                </Link>
              </li>
              <li>
                <Link to="/?category=3" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  办公效率
                </Link>
              </li>
              <li>
                <Link to="/?category=4" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  学习教育
                </Link>
              </li>
              <li>
                <Link to="/?category=5" className="text-gray-400 hover:text-neon-cyan-400 transition-colors">
                  娱乐休闲
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 AI 项目广场. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-coral-red-400 fill-current" /> by the community
          </p>
        </div>
      </div>
    </footer>
  );
}
