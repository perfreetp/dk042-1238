import { request } from './client.js';
import type { Topic } from '../../shared/types/index.js';

export const topicAPI = {
  getAll: () =>
    request<Topic[]>({
      method: 'GET',
      url: '/topics',
    }),

  getDetail: (id: number) =>
    request<Topic>({
      method: 'GET',
      url: `/topics/${id}`,
    }),
};
