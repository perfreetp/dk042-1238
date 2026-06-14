import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../shared/types/index.js';

const API_BASE_URL = '/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function request<T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await client.request<ApiResponse<T>>(config);
    return response as unknown as ApiResponse<T>;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data as ApiResponse<T>;
    }
    return {
      code: error.response?.status || 500,
      message: error.message || '请求失败',
      data: null,
    };
  }
}

export default client;
