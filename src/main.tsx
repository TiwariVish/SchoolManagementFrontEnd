import '@fontsource-variable/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import type { ApiError } from '@/api/errors';
import { AcademicYearProvider } from '@/app/AcademicYearProvider';
import { AuthProvider } from '@/app/AuthProvider';
import { router } from '@/app/router';
import { ColorModeProvider } from '@/theme/color-mode';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        const status = (error as ApiError).status;
        return count < 2 && (status === 0 || status >= 500);
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={4000} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <AuthProvider>
            <AcademicYearProvider>
              <RouterProvider router={router} />
            </AcademicYearProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
