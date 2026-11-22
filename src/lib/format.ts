import dayjs from 'dayjs';

export const formatDate = (value?: string | Date | null, pattern = 'D MMM YYYY') =>
  value ? dayjs(value).format(pattern) : '—';

export const toInputDate = (value?: string | Date | null) => (value ? dayjs(value).format('YYYY-MM-DD') : '');

export const fullName = (person?: { firstName?: string; lastName?: string } | null) =>
  person ? [person.firstName, person.lastName].filter(Boolean).join(' ') : '';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const AVATAR_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const daysUntil = (value?: string) => (value ? Math.ceil(dayjs(value).diff(dayjs(), 'day', true)) : null);
