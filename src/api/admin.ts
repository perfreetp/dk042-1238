import { request } from './client.js';
import type { PaginatedResponse, Project, Topic } from '../../shared/types/index.js';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  pendingProjects: number;
  totalViews: number;
  totalLikes: number;
  todayNewProjects: number;
  todayNewUsers: number;
}

interface ProjectListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export const adminAPI = {
  getStats: () =>
    request<AdminStats>({
      method: 'GET',
      url: '/admin/stats',
    }),

  getPendingProjects: (params?: { page?: number; pageSize?: number }) =>
    request<PaginatedResponse<Project>>({
      method: 'GET',
      url: '/admin/projects/pending',
      params,
    }),

  getAllProjects: (params?: ProjectListParams) =>
    request<PaginatedResponse<Project>>({
      method: 'GET',
      url: '/admin/projects/all',
      params,
    }),

  approveProject: (id: number) =>
    request<void>({
      method: 'PUT',
      url: `/admin/projects/${id}/approve`,
    }),

  rejectProject: (id: number, reason?: string) =>
    request<void>({
      method: 'PUT',
      url: `/admin/projects/${id}/reject`,
      data: { reason },
    }),

  markBroken: (id: number, isBroken: boolean) =>
    request<void>({
      method: 'PUT',
      url: `/admin/projects/${id}/mark-broken`,
      data: { isBroken },
    }),

  setFeatured: (id: number, isFeatured: boolean) =>
    request<void>({
      method: 'PUT',
      url: `/admin/projects/${id}/feature`,
      data: { isFeatured },
    }),

  getTopics: () =>
    request<Topic[]>({
      method: 'GET',
      url: '/admin/topics',
    }),

  createTopic: (data: { title: string; description?: string; coverImage?: string; projectIds?: number[] }) =>
    request<{ id: number }>({
      method: 'POST',
      url: '/admin/topics',
      data,
    }),

  updateTopic: (id: number, data: { title?: string; description?: string; coverImage?: string; projectIds?: number[] }) =>
    request<void>({
      method: 'PUT',
      url: `/admin/topics/${id}`,
      data,
    }),

  deleteTopic: (id: number) =>
    request<void>({
      method: 'DELETE',
      url: `/admin/topics/${id}`,
    }),
};
