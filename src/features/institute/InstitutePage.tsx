import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, Chip, Grid, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useInstitute, useUpdateInstitute } from '@/api/hooks';
import { useAuth } from '@/app/auth';
import { FormText } from '@/components/form';
import { LoadingButton } from '@/components/LoadingButton';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/states';
import { StatusChip } from '@/components/StatusChip';
import { daysUntil, formatDate, titleCase } from '@/lib/format';
import { MODULE_NAMES } from '@/lib/modules';
import { useNotify } from '@/lib/notify';

const schema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.union([z.literal(''), z.string().trim().email('Invalid email')]),
  phone: z.string().trim().max(20),
  timezone: z.string().trim().min(1),
  address: z.object({
    line1: z.string().trim().max(200),
    line2: z.string().trim().max(200),
    city: z.string().trim().max(80),
    state: z.string().trim().max(80),
    postalCode: z.string().trim().max(12),
  }),
});
type Values = z.infer<typeof schema>;

export function InstitutePage() {
  const { can } = useAuth();
  const notify = useNotify();
  const { data, isLoading, error, refetch } = useInstitute();
  const update = useUpdateInstitute();
  const canManage = can('institute.manage');
  const { control, handleSubmit, reset, setError, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name,
      email: data.email ?? '',
      phone: data.phone ?? '',
      timezone: data.timezone,
      address: {
        line1: data.address?.line1 ?? '',
        line2: data.address?.line2 ?? '',
        city: data.address?.city ?? '',
        state: data.address?.state ?? '',
        postalCode: data.address?.postalCode ?? '',
      },
    });
  }, [data, reset]);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const submit = handleSubmit(async ({ email, phone, ...values }) => {
    try {
      await update.mutateAsync({ ...values, email: email || undefined, phone: phone || undefined });
      notify.success('Institute profile saved');
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  const trialDays = data.status === 'TRIAL' ? daysUntil(data.trialEndsAt) : null;

  return (
    <>
      <PageHeader title="Institute" subtitle="Your institute's profile and plan." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card component="form" noValidate onSubmit={submit}>
            <CardHeader title="Profile" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormText control={control} name="name" label="Institute name" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormText control={control} name="email" label="Email" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormText control={control} name="phone" label="Phone" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormText control={control} name="timezone" label="Time zone" helperText="e.g. Asia/Kolkata" disabled={!canManage} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Address
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormText control={control} name="address.line1" label="Address line 1" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormText control={control} name="address.line2" label="Address line 2" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormText control={control} name="address.city" label="City" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormText control={control} name="address.state" label="State" disabled={!canManage} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormText control={control} name="address.postalCode" label="PIN code" disabled={!canManage} />
                </Grid>
              </Grid>
              {canManage && (
                <LoadingButton type="submit" variant="contained" loading={update.isPending} disabled={!formState.isDirty} sx={{ mt: 3 }}>
                  Save changes
                </LoadingButton>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Card>
              <CardHeader title="Plan" />
              <CardContent>
                <Stack spacing={1.5}>
                  <Row label="Code" value={<Chip size="small" variant="outlined" label={data.code} />} />
                  <Row label="Type" value={titleCase(data.type)} />
                  <Row label="Status" value={<StatusChip value={data.status} />} />
                  {trialDays !== null && <Row label="Trial ends" value={`${formatDate(data.trialEndsAt)} (${Math.max(trialDays, 0)} days)`} />}
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Modules" subheader="Features enabled for your institute" />
              <CardContent>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {data.modules.map((m) => (
                    <Chip key={m} color="primary" variant="outlined" label={MODULE_NAMES[m] ?? m} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} component="div">
        {value}
      </Typography>
    </Stack>
  );
}
