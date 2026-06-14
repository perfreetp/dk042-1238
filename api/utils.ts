import type { Project, User, Category, Comment, Topic } from '../shared/types/index.js';

export function mapProject(row: any, includeRelations: boolean = true): Project {
  const project: Project = {
    id: row.id,
    title: row.title,
    description: row.description,
    coverImage: row.cover_image,
    screenshots: row.screenshots ? JSON.parse(row.screenshots) : [],
    categoryId: row.category_id,
    tags: row.tags ? JSON.parse(row.tags) : [],
    authorId: row.author_id,
    collaborators: [],
    experienceUrl: row.experience_url,
    experienceType: row.experience_type as 'iframe' | 'external',
    isFree: row.is_free === 1,
    usageLimit: row.usage_limit,
    techStack: row.tech_stack ? JSON.parse(row.tech_stack) : [],
    openSourceUrl: row.open_source_url,
    license: row.license,
    viewsCount: row.views_count,
    likesCount: row.likes_count,
    favoritesCount: row.favorites_count,
    commentsCount: row.comments_count,
    status: row.status as 'pending' | 'approved' | 'rejected',
    isFeatured: row.is_featured === 1,
    isBroken: row.is_broken === 1,
    changelog: row.changelog ? JSON.parse(row.changelog) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isLiked: row.is_liked === 1,
    isFavorited: row.is_favorited === 1
  };

  if (includeRelations) {
    if (row.category_name) {
      project.category = {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        icon: row.category_icon,
        description: row.category_description,
        projectCount: row.category_project_count
      };
    }

    if (row.author_username) {
      project.author = {
        id: row.author_id,
        username: row.author_username,
        email: row.author_email,
        avatar: row.author_avatar,
        bio: row.author_bio,
        role: row.author_role,
        followersCount: row.author_followers_count,
        followingCount: row.author_following_count,
        createdAt: row.author_created_at
      };
    }
  }

  return project;
}

export function mapUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar,
    bio: row.bio,
    role: row.role,
    followersCount: row.followers_count,
    followingCount: row.following_count,
    createdAt: row.created_at
  };
}

export function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    projectCount: row.project_count
  };
}

export function mapComment(row: any): Comment {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    user: row.user_username ? {
      id: row.user_id,
      username: row.user_username,
      email: row.user_email,
      avatar: row.user_avatar,
      bio: row.user_bio,
      role: row.user_role,
      followersCount: row.user_followers_count,
      followingCount: row.user_following_count,
      createdAt: row.user_created_at
    } : {} as User,
    content: row.content,
    createdAt: row.created_at,
    likesCount: row.likes_count
  };
}

export function mapTopic(row: any): Topic {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    coverImage: row.cover_image,
    projectIds: row.project_ids ? JSON.parse(row.project_ids) : [],
    createdAt: row.created_at
  };
}

export function successResponse<T>(data: T, message: string = 'success') {
  return {
    code: 200,
    message,
    data
  };
}

export function errorResponse(message: string, code: number = 400) {
  return {
    code,
    message,
    data: null
  };
}
