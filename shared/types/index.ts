export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'user' | 'creator' | 'admin';
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  projectCount: number;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  description: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  screenshots: string[];
  categoryId: number;
  category?: Category;
  tags: string[];
  authorId: number;
  author?: User;
  collaborators: User[];
  experienceUrl: string;
  experienceType: 'iframe' | 'external';
  isFree: boolean;
  usageLimit: string;
  techStack: string[];
  openSourceUrl: string;
  license: string;
  viewsCount: number;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  isBroken: boolean;
  changelog: ChangelogEntry[];
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isFavorited?: boolean;
}

export interface Comment {
  id: number;
  projectId: number;
  userId: number;
  user: User;
  content: string;
  createdAt: string;
  likesCount: number;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  projectIds: number[];
  projects?: Project[];
  createdAt: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  categoryId: number;
  tags: string[];
  experienceUrl: string;
  experienceType: 'iframe' | 'external';
  isFree: boolean;
  usageLimit: string;
  techStack: string[];
  openSourceUrl: string;
  license: string;
  changelog: ChangelogEntry[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  coverImage?: string;
  screenshots?: string[];
}
