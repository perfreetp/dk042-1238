import { request } from './client.js';
import type { User, LoginRequest, RegisterRequest } from '../../shared/types/index.js';

interface LoginResponse {
  token: string;
  user: User;
}

export const authAPI = {
  login: (data: LoginRequest) => 
    request<LoginResponse>({
      method: 'POST',
      url: '/auth/login',
      data,
    }),

  register: (data: RegisterRequest) =>
    request<LoginResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    }),

  getCurrentUser: () =>
    request<User>({
      method: 'GET',
      url: '/auth/me',
    }),
};
