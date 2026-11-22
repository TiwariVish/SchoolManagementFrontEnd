import { createContext, useContext } from 'react';
import type { SessionKind } from '@/api/session';
import type { Labels, Me, PlatformAdmin } from '@/api/types';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface OnboardingInput {
  institute: { name: string; code: string; type: string; timezone?: string; email?: string; phone?: string };
  admin: { name: string; email: string; password: string };
  academicYear: { name: string; startDate: string; endDate: string };
}

export interface AuthContextValue {
  status: AuthStatus;
  /** Which kind of account is signed in: an institute user or the platform super admin. */
  kind: SessionKind;
  me: Me | undefined;
  platformAdmin: PlatformAdmin | undefined;
  labels: Labels;
  login: (input: { email: string; password: string; instituteCode?: string }) => Promise<void>;
  platformLogin: (input: { email: string; password: string }) => Promise<void>;
  register: (input: OnboardingInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<unknown>;
  can: (...permissions: string[]) => boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

export const DEFAULT_LABELS: Labels = {
  academicYear: 'Academic Year',
  program: 'Program',
  level: 'Class',
  section: 'Section',
  subject: 'Subject',
  term: 'Term',
  student: 'Student',
  teacher: 'Teacher',
  guardian: 'Parent',
  classTeacher: 'Class Teacher',
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}

/** Plural form of a configurable label: "Class" → "Classes", "Faculty" → "Faculty". */
export function plural(label: string): string {
  if (/(faculty|staff)$/i.test(label)) return label;
  if (/(s|x|ch|sh)$/i.test(label)) return `${label}es`;
  if (/[^aeiou]y$/i.test(label)) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
}
