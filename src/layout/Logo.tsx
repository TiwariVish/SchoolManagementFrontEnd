import { Box, Stack, Typography } from '@mui/material';

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Box
      component="img"
      src="/favicon.svg"
      alt=""
      sx={{ width: size, height: size, borderRadius: size / 4, boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)' }}
    />
  );
}

export function Logo({ collapsed, light }: { collapsed?: boolean; light?: boolean }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <LogoMark />
      {!collapsed && (
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" color={light ? '#fff' : 'text.primary'}>
          iSkool
        </Typography>
      )}
    </Stack>
  );
}
