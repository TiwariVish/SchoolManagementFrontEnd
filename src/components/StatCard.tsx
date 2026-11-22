import { Avatar, Box, Card, CardActionArea, CardContent, Skeleton, Stack, Typography, alpha } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color?: string;
  hint?: ReactNode;
  loading?: boolean;
  to?: string;
}

export function StatCard({ label, value, icon, color = '#4f46e5', hint, loading, to }: Props) {
  const content = (
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, mb: 0.5 }}>
            {loading ? <Skeleton width={64} /> : value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
        <Avatar variant="rounded" sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: alpha(color, 0.12), color }}>
          {icon}
        </Avatar>
      </Stack>
    </CardContent>
  );
  return (
    <Card sx={{ height: '100%' }}>
      {to ? (
        <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
