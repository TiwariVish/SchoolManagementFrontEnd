import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAcademicYear } from '@/app/academic-year';
import { useAuth } from '@/app/auth';
import { LoadingState } from '@/components/states';
import { colorFor, initials, titleCase } from '@/lib/format';
import { useColorMode } from '@/theme/color-mode';
import { SIDEBAR_COLLAPSED, SIDEBAR_WIDTH, Sidebar } from './Sidebar';

const COLLAPSE_KEY = 'iskool.sidebarCollapsed';

export function AppShell() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const width = desktop ? (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH) : 0;

  const toggleSidebar = () => {
    if (!desktop) return setMobileOpen(true);
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '0' : '1');
    setCollapsed(!collapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {desktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width,
            flexShrink: 0,
            transition: theme.transitions.create('width'),
            '& .MuiDrawer-paper': {
              width,
              overflowX: 'hidden',
              borderRight: 1,
              borderColor: 'divider',
              transition: theme.transitions.create('width'),
            },
          }}
        >
          <Sidebar collapsed={collapsed} />
        </Drawer>
      ) : (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
        >
          <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar onMenu={toggleSidebar} collapsed={collapsed && desktop} />
        <YearBanner />
        <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, sm: 3.5 }, maxWidth: 1440, width: '100%', mx: 'auto' }}>
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

function TopBar({ onMenu, collapsed }: { onMenu: () => void; collapsed: boolean }) {
  const { me, logout, can } = useAuth();
  const { mode, toggle } = useColorMode();
  const { years, yearId, setYearId } = useAcademicYear();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const name = me?.user.name ?? '';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={(t) => ({
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: alpha(t.palette.background.default, 0.8),
        backdropFilter: 'saturate(180%) blur(12px)',
      })}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, sm: 68 } }}>
        <IconButton onClick={onMenu} edge="start" aria-label="Toggle navigation">
          {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
        </IconButton>
        <Box sx={{ flex: 1 }} />

        {can('academic.read') && years.length > 0 && (
          <TextField
            select
            size="small"
            value={yearId ?? ''}
            onChange={(e) => setYearId(e.target.value)}
            SelectProps={{ native: true }}
            InputProps={{ startAdornment: <EventRoundedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ width: { xs: 160, sm: 230 } }}
            aria-label="Academic year"
          >
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
                {year.id === me?.currentAcademicYearId ? ' (current)' : year.status === 'CLOSED' ? ' (closed)' : ''}
              </option>
            ))}
          </TextField>
        )}

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
              {me?.user.email}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
              {me?.roles.map((role) => (
                <Typography key={role} variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: 'action.hover', fontWeight: 600 }}>
                  {titleCase(role)}
                </Typography>
              ))}
            </Stack>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchor(null);
              navigate('/account/password');
            }}
          >
            <ListItemIcon>
              <KeyRoundedIcon fontSize="small" />
            </ListItemIcon>
            Change password
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              void logout().then(() => navigate('/login'));
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
  );
}

function YearBanner() {
  const { year, isCurrent, isClosed } = useAcademicYear();
  if (!year || (isCurrent && !isClosed)) return null;
  return (
    <Alert severity={isClosed ? 'warning' : 'info'} sx={{ borderRadius: 0, py: 0.25 }}>
      You are viewing <b>{year.name}</b>
      {isClosed ? ' — this year is closed and read-only.' : ', which is not the current academic year.'}
    </Alert>
  );
}
