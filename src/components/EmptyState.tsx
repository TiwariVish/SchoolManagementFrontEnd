import { Avatar, Box, Typography, alpha } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, icon, action, compact }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: compact ? 4 : 8, px: 3 }}>
      <Avatar
        sx={(theme) => ({
          mx: 'auto',
          mb: 2,
          width: 56,
          height: 56,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
        })}
      >
        {icon ?? <InboxRoundedIcon />}
      </Avatar>
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
}
