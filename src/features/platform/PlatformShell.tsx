import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { Suspense, useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { LoadingState } from '@/components/states';
import { Logo } from '@/layout/Logo';
import { colorFor, formatDate, initials } from '@/lib/format';
import { useColorMode } from '@/theme/color-mode';

export function PlatformShell() {
  const { platformAdmin, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const name = platformAdmin?.name ?? '';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={(t) => ({
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha(t.palette.background.default, 0.85),
          backdropFilter: 'saturate(180%) blur(12px)',
        })}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, sm: 68 }, maxWidth: 1440, width: '100%', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box component={RouterLink} to="/platform" sx={{ textDecoration: 'none', display: 'flex' }}>
            <Logo />
          </Box>
          <Chip
            size="small"
            icon={<AdminPanelSettingsRoundedIcon />}
            label="Super admin"
            color="primary"
            sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
          />
          <Box sx={{ flex: 1 }} />
          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton onClick={toggle}>{mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}</IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }} aria-label="Account menu">
            <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: colorFor(name) }}>{initials(name)}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 260, mt: 1, borderRadius: 3, border: 1, borderColor: 'divider' } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography fontWeight={700} noWrap>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {platformAdmin?.email}
              </Typography>
              {platformAdmin?.lastLoginAt && (
                <Typography variant="caption" color="text.secondary">
                  Last sign-in {formatDate(platformAdmin.lastLoginAt, 'D MMM YYYY, h:mm A')}
                </Typography>
              )}
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchor(null);
                void logout().then(() => navigate('/platform/login'));
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, sm: 3.5 }, maxWidth: 1440, width: '100%', mx: 'auto' }}>
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  );
}
