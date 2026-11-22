import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Box, Button } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/states';
import { useAuth } from './auth';

const homeFor = (kind: 'institute' | 'platform') => (kind === 'platform' ? '/platform' : '/');

/** Institute app: signed-in school/college users only. */
export function RequireAuth() {
  const { status, kind, me } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState height="100vh" />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (kind === 'platform') return <Navigate to="/platform" replace />;
  if (me?.user.mustChangePassword && location.pathname !== '/account/password') {
    return <Navigate to="/account/password" replace />;
  }
  return <Outlet />;
}

/** Super-admin console: platform sessions only. */
export function RequirePlatform() {
  const { status, kind } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState height="100vh" />;
  if (status === 'anonymous') return <Navigate to="/platform/login" replace state={{ from: location.pathname + location.search }} />;
  if (kind !== 'platform') return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const { status, kind } = useAuth();
  if (status === 'loading') return <LoadingState height="100vh" />;
  if (status === 'authenticated') return <Navigate to={homeFor(kind)} replace />;
  return <Outlet />;
}

export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { can } = useAuth();
  if (can(permission)) return <>{children}</>;
  return (
    <Box sx={{ py: 6 }}>
      <EmptyState
        icon={<LockRoundedIcon />}
        title="You don't have access to this page"
        description="Ask your administrator if you need it."
        action={
          <Button component={RouterLink} to="/" variant="contained">
            Go to dashboard
          </Button>
        }
      />
    </Box>
  );
}
