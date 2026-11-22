import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Logo } from '@/layout/Logo';

const HIGHLIGHTS = [
  'One platform for schools, colleges and universities',
  'Classes, sections, subjects and teacher allocation in minutes',
  'Role-based access for admins, principals and teachers',
];

interface Props {
  children: ReactNode;
  headline?: string;
  highlights?: string[];
}

export function AuthLayout({
  children,
  headline = 'Run your entire institute from one calm dashboard.',
  highlights = HIGHLIGHTS,
}: Props) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '5fr 6fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(1200px 600px at -10% -10%, #6366f1 0%, transparent 60%), radial-gradient(900px 500px at 110% 110%, #a855f7 0%, transparent 55%), #1e1b4b',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <Box sx={{ position: 'relative' }}>
          <Logo light />
        </Box>
        <Box sx={{ position: 'relative', maxWidth: 480 }}>
          <Typography variant="h3" sx={{ fontSize: { md: '2.2rem', lg: '2.75rem' }, lineHeight: 1.15 }}>
            {headline}
          </Typography>
          <Stack spacing={1.75} sx={{ mt: 4 }}>
            {highlights.map((text) => (
              <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                <CheckCircleRoundedIcon sx={{ color: '#a5b4fc' }} />
                <Typography sx={{ opacity: 0.92 }}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ position: 'relative', opacity: 0.6 }}>
          © {new Date().getFullYear()} iSkool
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 6 }, bgcolor: 'background.paper' }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ display: { md: 'none' }, mb: 4 }}>
            <Logo />
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
