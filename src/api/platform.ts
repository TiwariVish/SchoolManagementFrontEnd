import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Page, PlatformInstitute, PlatformInstituteDetail, PlatformOverview, SubscriptionUpdate } from './types';

export interface InstituteFilters {
  q?: string;
  type?: string;
  status?: string;
  sort?: string;
  page: number;
  limit: number;
}

const clean = (params: object) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

export const usePlatformOverview = () =>
  useQuery({
    queryKey: ['platform', 'overview'],
    queryFn: async () => (await api.get<PlatformOverview>('/platform/overview')).data,
  });

export const usePlatformInstitutes = (filters: InstituteFilters) =>
  useQuery({
    queryKey: ['platform', 'institutes', filters],
    queryFn: async () => (await api.get<Page<PlatformInstitute>>('/platform/institutes', { params: clean(filters) })).data,
    placeholderData: keepPreviousData,
  });

export const usePlatformInstitute = (id: string) =>
  useQuery({
    queryKey: ['platform', 'institute', id],
    queryFn: async () => (await api.get<PlatformInstituteDetail>(`/platform/institutes/${id}`)).data,
  });

export function useUpdateSubscription(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: SubscriptionUpdate) =>
      (await api.patch<PlatformInstituteDetail>(`/platform/institutes/${id}/subscription`, body)).data,
    onSuccess: (detail) => {
      client.setQueryData(['platform', 'institute', id], detail);
      void client.invalidateQueries({ queryKey: ['platform', 'institutes'] });
      void client.invalidateQueries({ queryKey: ['platform', 'overview'] });
    },
  });
}
