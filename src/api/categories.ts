import { request } from './client.js';
import type { Category } from '../../shared/types/index.js';

export const categoryAPI = {
  getAll: () =>
    request<Category[]>({
      method: 'GET',
      url: '/categories',
    }),
};
