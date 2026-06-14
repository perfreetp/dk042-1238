import { request } from './client.js';
import type { Project, PaginatedResponse, Comment, CreateProjectRequest } from '../../shared/types/index.js';

interface ProjectListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  sort?: 'latest' | 'hot' | 'views' | 'likes';
  search?: string;
}

export const projectAPI = {
  getList: (params?: ProjectListParams) =>
    request<PaginatedResponse<Project>>({
      method: 'GET',
      url: '/projects',
      params,
    }),

  getHot: (limit?: number) =>
    request<Project[]>({
      method: 'GET',
      url: '/projects/hot',
      params: { limit },
    }),

  getDetail: (id: number) =>
    request<Project>({
      method: 'GET',
      url: `/projects/${id}`,
    }),

  create: (data: CreateProjectRequest & { coverImage?: string; screenshots?: string[] }) =>
    request<{ id: number }>({
      method: 'POST',
      url: '/projects',
      data,
    }),

  like: (id: number) =>
    request<{ liked: boolean }>({
      method: 'POST',
      url: `/projects/${id}/like`,
    }),

  favorite: (id: number) =>
    request<{ favorited: boolean }>({
      method: 'POST',
      url: `/projects/${id}/favorite`,
    }),

  getComments: (id: number) =>
    request<Comment[]>({
      method: 'GET',
      url: `/projects/${id}/comments`,
    }),

  addComment: (id: number, content: string) =>
    request<{ id: number }>({
      method: 'POST',
      url: `/projects/${id}/comments`,
      data: { content },
    }),

  submitFeedback: (id: number, type: string, content: string) =>
    request<void>({
      method: 'POST',
      url: `/projects/${id}/feedback`,
      data: { type, content },
    }),

  applyCollab: (id: number, message?: string) =>
    request<void>({
      method: 'POST',
      url: `/projects/${id}/collab`,
      data: { message },
    }),
};
