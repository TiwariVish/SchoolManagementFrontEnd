import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, refreshSession } from '@/api/client';
import { session, type SessionKind } from '@/api/session';
import type { Me, PlatformAdmin, TokenPair } from '@/api/types';
import { AuthContext, DEFAULT_LABELS, type AuthStatus, type OnboardingInput } from './auth';

const fetchMe = async () => (await api.get<Me>('/auth/me')).data;
const fetchPlatformAdmin = async () => (await api.get<{ admin: PlatformAdmin }>('/platform/auth/me')).data.admin;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>(() => (session.hasSession ? 'loading' : 'anonymous'));
  const [kind, setKind] = useState<SessionKind>(() => session.kind);

  useEffect(() => {
    if (status !== 'loading') return;
    let cancelled = false;
    (session.access ? Promise.resolve(true) : refreshSession()).then((ok) => {
      if (!cancelled) setStatus(ok ? 'authenticated' : 'anonymous');
    });
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(
    () =>
      session.onEnd(() => {
        setStatus('anonymous');
        queryClient.clear();
      }),
    [queryClient],
  );

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: status === 'authenticated' && kind === 'institute',
    staleTime: 60_000,
  });

  const platformQuery = useQuery({
    queryKey: ['platform', 'me'],
    queryFn: fetchPlatformAdmin,
    enabled: status === 'authenticated' && kind === 'platform',
    staleTime: 60_000,
  });

  const startSession = useCallback(
    async (tokens: TokenPair, nextKind: SessionKind) => {
      queryClient.clear();
      session.academicYearId = null;
      session.save(tokens, nextKind);
      setKind(nextKind);
      setStatus('authenticated');
      if (nextKind === 'platform') await queryClient.fetchQuery({ queryKey: ['platform', 'me'], queryFn: fetchPlatformAdmin });
      else await queryClient.fetchQuery({ queryKey: ['me'], queryFn: fetchMe });
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: { email: string; password: string; instituteCode?: string }) => {
      const { data } = await api.post<TokenPair>('/auth/login', input);
      await startSession(data, 'institute');
    },
    [startSession],
  );

  const platformLogin = useCallback(
    async (input: { email: string; password: string }) => {
      const { data } = await api.post<TokenPair>('/platform/auth/login', input);
      await startSession(data, 'platform');
    },
    [startSession],
  );

  const register = useCallback(
    async (input: OnboardingInput) => {
      const { data } = await api.post<{ tokens: TokenPair }>('/onboarding/institutes', input);
      await startSession(data.tokens, 'institute');
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post(session.kind === 'platform' ? '/platform/auth/logout' : '/auth/logout');
    } catch {
      // The session is cleared locally either way.
    }
    session.clear();
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  const me = meQuery.data;
  const platformAdmin = platformQuery.data;
  const value = useMemo(() => {
    const permissions = new Set(me?.access.permissions ?? []);
    const can = (...required: string[]) => Boolean(me && (me.access.grantsAll || required.every((p) => permissions.has(p))));
    const profileLoaded = kind === 'platform' ? Boolean(platformAdmin) : Boolean(me);
    return {
      status: status === 'authenticated' && !profileLoaded ? ('loading' as const) : status,
      kind,
      me,
      platformAdmin,
      labels: me?.labels ?? DEFAULT_LABELS,
      login,
      platformLogin,
      register,
      logout,
      refreshMe: () => (kind === 'platform' ? platformQuery.refetch() : meQuery.refetch()),
      can,
      isAdmin: Boolean(me?.access.grantsAll || me?.roles.includes('PRINCIPAL')),
      isTeacher: Boolean(me?.roles.includes('TEACHER')),
    };
  }, [me, platformAdmin, kind, status, login, platformLogin, register, logout, meQuery, platformQuery]);

  const profileFailed = status === 'authenticated' && (kind === 'platform' ? platformQuery.isError : meQuery.isError);
  useEffect(() => {
    if (profileFailed) void logout();
  }, [profileFailed, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
