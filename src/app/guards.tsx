import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Box, Button } from '@mui/material';
import { useEffect, type ReactNode } from 'react';
import { Link as RouterLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { session } from '@/api/session';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/states';
import { useAuth } from './auth';

/** Institute app: signed-in school/college users only. Super-admin uses http://localhost:5174. */
export function RequireAuth() {
  const { status, kind, me } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (status === 'authenticated' && kind === 'platform') session.clear();
  }, [status, kind]);

  if (status === 'loading') return <LoadingState height="100vh" />;
  if (status === 'anonymous' || kind === 'platform') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (me?.user.mustChangePassword && location.pathname !== '/account/password') {
    return <Navigate to="/account/password" replace />;
  }
  return <Outlet />;
}

export function GuestOnly() {
  const { status, kind } = useAuth();

  useEffect(() => {
    if (status === 'authenticated' && kind === 'platform') session.clear();
  }, [status, kind]);

  if (status === 'loading') return <LoadingState height="100vh" />;
  if (status === 'authenticated' && kind === 'institute') return <Navigate to="/" replace />;
  if (status === 'authenticated' && kind === 'platform') return <Navigate to="/login" replace />;
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
