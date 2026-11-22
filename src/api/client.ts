import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toApiError } from './errors';
import { session } from './session';
import type { TokenPair } from './types';

export const API_URL = import.meta.env.VITE_API_URL ?? '/v1';

export const api = axios.create({ baseURL: API_URL, timeout: 20_000 });

api.interceptors.request.use((config) => {
  if (session.access) config.headers.Authorization = `Bearer ${session.access}`;
  if (session.kind === 'institute' && session.academicYearId && !config.headers.has('x-academic-year')) {
    config.headers.set('x-academic-year', session.academicYearId);
  }
  return config;
});

let refreshing: Promise<boolean> | null = null;

/** Exchanges the refresh token once, even if many requests fail with 401 at the same time. */
export function refreshSession(): Promise<boolean> {
  const refreshToken = session.refresh;
  if (!refreshToken) return Promise.resolve(false);
  const path = session.kind === 'platform' ? '/platform/auth/refresh' : '/auth/refresh';
  refreshing ??= axios
    .post<TokenPair>(`${API_URL}${path}`, { refreshToken })
    .then(({ data }) => {
      session.save(data);
      return true;
    })
    .catch(() => {
      session.clear();
      return false;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const TOKEN_ENDPOINTS = new Set(['/auth/login', '/auth/refresh', '/platform/auth/login', '/platform/auth/refresh']);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isTokenEndpoint = TOKEN_ENDPOINTS.has(config?.url ?? '');
    if (error.response?.status === 401 && config && !config._retried && !isTokenEndpoint) {
      config._retried = true;
      if (await refreshSession()) return api(config);
    }
    return Promise.reject(toApiError(error));
  },
);
