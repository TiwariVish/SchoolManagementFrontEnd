import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Box, Button, CircularProgress } from '@mui/material';
import { errorMessage } from '@/api/errors';
import { EmptyState } from './EmptyState';

export function LoadingState({ height = 320 }: { height?: number | string }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height }}>
      <CircularProgress size={32} />
    </Box>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<ErrorOutlineRoundedIcon />}
      title="Couldn't load this"
      description={errorMessage(error)}
      action={onRetry && <Button onClick={onRetry}>Try again</Button>}
    />
  );
}
