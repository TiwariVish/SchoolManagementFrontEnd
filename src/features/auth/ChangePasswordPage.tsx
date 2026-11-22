import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Card, CardContent, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { useAuth } from '@/app/auth';
import { LoadingButton } from '@/components/LoadingButton';
import { PageHeader } from '@/components/PageHeader';
import { useNotify } from '@/lib/notify';
import { PASSWORD_HINT, PASSWORD_RULE, PasswordField } from './PasswordField';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().regex(PASSWORD_RULE, PASSWORD_HINT),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type Values = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const { me, refreshMe } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      await refreshMe();
      notify.success('Password updated. Other devices have been signed out.');
      navigate('/');
    } catch (err) {
      setError('currentPassword', { message: errorMessage(err) });
    }
  });

  return (
    <>
      <PageHeader title="Change password" subtitle="Use a password you don't use anywhere else." />
      <Card sx={{ maxWidth: 520 }}>
        <CardContent component="form" noValidate onSubmit={submit}>
          <Stack spacing={2.25}>
            {me?.user.mustChangePassword && (
              <Alert severity="warning">You are using a temporary password. Please set your own to continue.</Alert>
            )}
            <PasswordField control={control} name="currentPassword" label="Current password" autoComplete="current-password" />
            <PasswordField control={control} name="newPassword" label="New password" helperText={PASSWORD_HINT} autoComplete="new-password" />
            <PasswordField control={control} name="confirm" label="Confirm new password" autoComplete="new-password" />
            <LoadingButton type="submit" variant="contained" loading={formState.isSubmitting} sx={{ alignSelf: 'flex-start' }}>
              Update password
            </LoadingButton>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
