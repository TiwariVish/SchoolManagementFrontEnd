import { zodResolver } from '@hookform/resolvers/zod';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {
  Alert,
  Avatar,
  Box,
  Link,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toApiError } from '@/api/errors';
import { useAuth } from '@/app/auth';
import { FormText } from '@/components/form';
import { LoadingButton } from '@/components/LoadingButton';
import { AuthLayout } from './AuthLayout';
import { PasswordField } from './PasswordField';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

interface InstituteChoice {
  code: string;
  name: string;
  type?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<InstituteChoice[] | null>(null);
  const [pending, setPending] = useState(false);

  const { control, handleSubmit, getValues } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const attempt = async (values: Values, instituteCode?: string) => {
    setError(null);
    setPending(true);
    try {
      await login({ ...values, instituteCode });
      navigate(from, { replace: true });
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.code === 'INSTITUTE_SELECTION_REQUIRED') {
        setChoices((apiError.data.institutes as InstituteChoice[]) ?? []);
      } else {
        setError(apiError.message);
      }
    } finally {
      setPending(false);
    }
  };

  if (choices) {
    return (
      <AuthLayout>
        <Typography variant="h4">Choose an institute</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Your account has access to more than one institute.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <List disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          {choices.map((choice) => (
            <ListItemButton key={choice.code} disabled={pending} onClick={() => attempt(getValues(), choice.code)} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ApartmentRoundedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={choice.name} secondary={choice.code} primaryTypographyProps={{ fontWeight: 600 }} />
              <ChevronRightRoundedIcon color="action" />
            </ListItemButton>
          ))}
        </List>
        <Link component="button" onClick={() => setChoices(null)} sx={{ mt: 3 }}>
          Use a different account
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Typography variant="h4">Welcome back</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Sign in to continue to your institute.
      </Typography>

      <Box component="form" noValidate onSubmit={handleSubmit((values) => attempt(values))}>
        <Stack spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormText control={control} name="email" label="Email" type="email" autoComplete="email" autoFocus />
          <PasswordField control={control} name="password" label="Password" autoComplete="current-password" />
          <LoadingButton type="submit" size="large" variant="contained" loading={pending} fullWidth>
            Sign in
          </LoadingButton>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        New to iSkool?{' '}
        <Link component={RouterLink} to="/register" fontWeight={600}>
          Set up your institute
        </Link>
      </Typography>
    </AuthLayout>
  );
}
