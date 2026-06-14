import { request } from './client.js';
import type { User, Project } from '../../shared/types/index.js';

export const userAPI = {
  getProfile: (id: number) =>
    request<User>({
      method: 'GET',
      url: `/users/${id}`,
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
