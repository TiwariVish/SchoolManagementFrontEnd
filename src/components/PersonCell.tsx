import { Avatar, Box, Stack, Typography } from '@mui/material';
import { colorFor, initials } from '@/lib/format';

export function PersonCell({ name, secondary, size = 36 }: { name: string; secondary?: string; size?: number }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar sx={{ width: size, height: size, fontSize: size * 0.38, fontWeight: 700, bgcolor: colorFor(name) }}>
        {initials(name) || '?'}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {name}
        </Typography>
        {secondary && (
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {secondary}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
