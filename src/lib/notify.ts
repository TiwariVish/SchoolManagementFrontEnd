import { useSnackbar } from 'notistack';
import { useMemo } from 'react';
import { errorMessage } from '@/api/errors';

export function useNotify() {
  const { enqueueSnackbar } = useSnackbar();
  return useMemo(
    () => ({
      success: (message: string) => enqueueSnackbar(message, { variant: 'success' }),
      info: (message: string) => enqueueSnackbar(message, { variant: 'info' }),
      error: (error: unknown) => enqueueSnackbar(errorMessage(error), { variant: 'error' }),
    }),
    [enqueueSnackbar],
  );
}
