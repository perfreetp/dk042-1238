import { request } from './client.js';
import type { User, Project } from '../../shared/types/index.js';

export const userAPI = {
  getProfile: (id: number) =>
    request<User>({
      method: 'GET',
      url: `/users/${id}`,
    }),

  updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
    request<User>({
      method: 'PUT',
      url: '/users/profile',
      data,
    }),

  getProjects: (id: number) =>
    request<Project[]>({
      method: 'GET',
      url: `/users/${id}/projects`,
    }),

  getFavorites: () =>
    request<Project[]>({
      method: 'GET',
      url: '/users/favorites',
    }),
};
