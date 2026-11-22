import {
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/auth';
import { useInstitute } from '@/api/hooks';
import { daysUntil, titleCase } from '@/lib/format';
import { Logo } from './Logo';
import { buildNav } from './nav';

export const SIDEBAR_WIDTH = 268;
export const SIDEBAR_COLLAPSED = 80;

export function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const auth = useAuth();
  const { pathname } = useLocation();
  const groups = buildNav(auth);
  const { data: institute } = useInstitute();
  const trialDays = institute?.status === 'TRIAL' ? daysUntil(institute.trialEndsAt) : null;

  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ px: collapsed ? 2.5 : 3, py: 2.5, display: 'flex', alignItems: 'center', minHeight: 72 }}>
        <Logo collapsed={collapsed} />
      </Box>

      {!collapsed && auth.me && (
        <Box
          sx={(theme) => ({
            mx: 2,
            mb: 1,
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.14),
          })}
        >
          <Typography variant="body2" fontWeight={700} noWrap title={auth.me.institute.name}>
            {auth.me.institute.name}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
            <Chip size="small" label={titleCase(auth.me.institute.type)} />
            <Chip size="small" variant="outlined" label={auth.me.institute.code} />
          </Stack>
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', px: collapsed ? 1.5 : 2, pb: 2 }}>
        {groups.map((group) => (
          <List
            key={group.title}
            dense
            subheader={
              collapsed ? (
                <Box sx={{ height: 12 }} />
              ) : (
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', px: 1.5 }}>
                  {group.title}
                </ListSubheader>
              )
            }
          >
            {group.items.map((item) => {
              const active = isActive(item.to);
              const button = (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={onNavigate}
                  selected={active}
                  sx={(theme) => ({
                    mb: 0.5,
                    py: 1,
                    px: 1.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.09 : 0.18),
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                    },
                    '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: 'inherit', '& svg': { fontSize: 21 } }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 650 : 550, fontSize: '0.9rem' }} />
                  )}
                </ListItemButton>
              );
              return collapsed ? (
                <Tooltip key={item.to} title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              );
            })}
          </List>
        ))}
      </Box>

      {!collapsed && trialDays !== null && (
        <Box
          sx={{
            m: 2,
            p: 2,
            borderRadius: 3,
            color: '#fff',
            background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
          }}
        >
          <RocketLaunchRoundedIcon />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            {trialDays > 0 ? `${trialDays} days left in trial` : 'Trial ended'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mb: 1.5 }}>
            Upgrade to keep every module active for your institute.
          </Typography>
          <Button size="small" variant="contained" sx={{ bgcolor: '#fff', color: '#4f46e5', backgroundImage: 'none', '&:hover': { bgcolor: '#eef2ff', backgroundImage: 'none' } }}>
            View plans
          </Button>
        </Box>
      )}
    </Stack>
  );
}
