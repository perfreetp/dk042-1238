import { Link } from 'react-router-dom';
import { Heart, Eye, Bookmark, Sparkles, AlertTriangle } from 'lucide-react';
import type { Project } from '../../shared/types/index.js';

interface ProjectCardProps {
  project: Project;
  onLike?: () => void;
  onFavorite?: () => void;
  showStats?: boolean;
}

export default function ProjectCard({ project, onLike, onFavorite, showStats = true }: ProjectCardProps) {
  return (
    <div className="glass-card overflow-hidden card-hover group animate-fade-in">
      <Link to={`/project/${project.id}`} className="block relative overflow-hidden">
        <div className="aspect-video relative">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-blue-950 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            {project.category && (
              <span className="tag text-xs">
                {project.category.name}
              </span>
            )}
            {project.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-electric-purple-500/20 text-electric-purple-400 border border-electric-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                精选
              </span>
            )}
          </div>

          {project.isBroken && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-coral-red-500/20 text-coral-red-400 border border-coral-red-400/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                失效
              </span>
            </div>
          )}

          {!project.isFree && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                付费
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/project/${project.id}`}>
          <h3 className="font-display font-semibold text-lg text-white mb-2 line-clamp-1 group-hover:text-neon-cyan-400 transition-colors">
            {project.title}
          </h3>
        </Link>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {project.author && (
            <Link to={`/author/${project.authorId}`} className="flex items-center gap-2 group/author">
              <img
                src={project.author.avatar}
                alt={project.author.username}
                className="w-6 h-6 rounded-full border border-white/20 group-hover/author:border-neon-cyan-400 transition-colors"
              />
              <span className="text-sm text-gray-400 group-hover/author:text-neon-cyan-400 transition-colors">
                {project.author.username}
              </span>
            </Link>
          )}

          {showStats && (
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onLike?.();
                }}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  project.isLiked ? 'text-coral-red-400' : 'text-gray-500 hover:text-coral-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${project.isLiked ? 'fill-current' : ''}`} />
                <span>{project.likesCount}</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFavorite?.();
                }}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  project.isFavorited ? 'text-neon-cyan-400' : 'text-gray-500 hover:text-neon-cyan-400'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${project.isFavorited ? 'fill-current' : ''}`} />
              </button>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{project.viewsCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
