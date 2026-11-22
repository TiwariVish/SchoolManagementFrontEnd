import { zodResolver } from '@hookform/resolvers/zod';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toApiError } from '@/api/errors';
import { useAuth } from '@/app/auth';
import { FormText } from '@/components/form';
import { LoadingButton } from '@/components/LoadingButton';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { PasswordField } from '@/features/auth/PasswordField';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

const HIGHLIGHTS = [
  'Every school, college and university you serve, in one list',
  'Trials, plans and modules managed per customer',
  'Every change recorded in an audit log',
];

export function PlatformLoginPage() {
  const { platformLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: string } | null)?.from ?? '/platform';

  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await platformLogin(values);
      navigate(from.startsWith('/platform') ? from : '/platform', { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    }
  });

  return (
    <AuthLayout headline="Your iSkool business, at a glance." highlights={HIGHLIGHTS}>
      <Chip
        icon={<AdminPanelSettingsRoundedIcon />}
        label="Platform console"
        color="primary"
        variant="outlined"
        sx={{ mb: 2, fontWeight: 600 }}
      />
      <Typography variant="h4">Super admin sign in</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        For the iSkool team only. School and college staff sign in on the regular login page.
      </Typography>

      <Box component="form" noValidate onSubmit={submit}>
        <Stack spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormText control={control} name="email" label="Email" type="email" autoComplete="username" autoFocus />
          <PasswordField control={control} name="password" label="Password" autoComplete="current-password" />
          <LoadingButton type="submit" size="large" variant="contained" loading={formState.isSubmitting} fullWidth>
            Sign in
          </LoadingButton>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
