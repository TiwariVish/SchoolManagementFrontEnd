import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { usePlatformInstitute, useUpdateSubscription } from '@/api/platform';
import type { InstituteStatus, PlatformAuditEntry, PlatformInstituteDetail, SubscriptionUpdate } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { PersonCell } from '@/components/PersonCell';
import { StatCard } from '@/components/StatCard';
import { ErrorState, LoadingState } from '@/components/states';
import { StatusChip } from '@/components/StatusChip';
import { formatDate, toInputDate } from '@/lib/format';
import { MODULE_NAMES, MODULES } from '@/lib/modules';
import { useNotify } from '@/lib/notify';
import { InstituteAvatar, STATUS_LABELS, SubscriptionStatus, TYPE_META } from './shared';

export function PlatformInstitutePage() {
  const { id = '' } = useParams();
  const { data, isLoading, error, refetch } = usePlatformInstitute(id);
  const update = useUpdateSubscription(id);
  const notify = useNotify();
  const [managing, setManaging] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const apply = async (body: SubscriptionUpdate, message: string) => {
    try {
      await update.mutateAsync(body);
      notify.success(message);
      return true;
    } catch (err) {
      notify.error(err);
      return false;
    }
  };

  const extendTrial = (days: number) => {
    const base = data.trialEndsAt && dayjs(data.trialEndsAt).isAfter(dayjs()) ? dayjs(data.trialEndsAt) : dayjs();
    const until = base.add(days, 'day').endOf('day');
    return apply({ status: 'TRIAL', trialEndsAt: until.toISOString(), note: `Trial extended by ${days} days` }, `Trial extended to ${until.format('D MMM YYYY')}`);
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Institutes', to: '/platform' }, { label: data.name }]}
        title={
          <Stack direction="row" spacing={2} alignItems="center">
            <InstituteAvatar type={data.type} size={48} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="span" sx={{ display: 'block' }} noWrap>
                {data.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="span">
                {TYPE_META[data.type].label} · {data.code} · joined {formatDate(data.createdAt)}
              </Typography>
            </Box>
          </Stack>
        }
        actions={
          <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => setManaging(true)}>
            Manage plan
          </Button>
        }
      />

      {data.status === 'SUSPENDED' && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          This institute is suspended. Nobody at {data.name} can use iSkool until you reactivate it.
        </Alert>
      )}
      {data.trialExpired && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          The trial ended on {formatDate(data.trialEndsAt)}. The institute can sign in and view data but cannot make changes.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2.5}>
            <Grid item xs={6} md={3}>
              <StatCard label="Students" value={data.usage.students.toLocaleString('en-IN')} icon={<GroupsRoundedIcon />} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard label="Staff" value={data.usage.staff} color="#0ea5e9" icon={<BadgeRoundedIcon />} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard label="Sections" value={data.usage.sections} color="#10b981" icon={<ClassRoundedIcon />} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard label="Logins" value={data.usage.logins} color="#f59e0b" icon={<KeyRoundedIcon />} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Administrators" subheader="Your contacts at this institute" />
                <CardContent sx={{ pt: 0 }}>
                  {data.admins.length ? (
                    <Stack spacing={2} divider={<Divider flexItem />}>
                      {data.admins.map((admin) => (
                        <Stack key={admin.email} direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <PersonCell name={admin.name} secondary={admin.email} />
                          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', flexShrink: 0 }}>
                            {admin.lastLoginAt ? `Active ${formatDate(admin.lastLoginAt)}` : 'Never signed in'}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">No active administrators.</Typography>
                  )}
                  {(data.email || data.phone) && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={1}>
                        {data.email && <Row label="Institute email" value={data.email} />}
                        {data.phone && <Row label="Phone" value={data.phone} />}
                        {data.address?.city && <Row label="City" value={[data.address.city, data.address.state].filter(Boolean).join(', ')} />}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Academic years" />
                <CardContent sx={{ pt: 0 }}>
                  {data.academicYears.length ? (
                    <Stack spacing={1.5}>
                      {data.academicYears.map((year) => (
                        <Stack key={year.id} direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography fontWeight={600}>
                              {year.name}
                              {year.current && <Chip size="small" color="primary" label="Current" sx={{ ml: 1, height: 20 }} />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(year.startDate)} – {formatDate(year.endDate)}
                            </Typography>
                          </Box>
                          <StatusChip value={year.status} />
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">No academic years yet.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader title="Change history" subheader="Every plan change made from this console" avatar={<HistoryRoundedIcon color="action" />} />
                <CardContent sx={{ pt: 0 }}>
                  {data.history.length ? <History entries={data.history} /> : <EmptyState compact title="No changes yet" />}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Card>
              <CardHeader title="Plan" />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.75}>
                  <Row label="Status" value={<SubscriptionStatus institute={data} />} />
                  {data.status === 'TRIAL' && <Row label="Trial ends" value={formatDate(data.trialEndsAt)} />}
                  <Row label="Time zone" value={data.timezone} />
                  <Row label="Currency" value={data.currency} />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
                  Quick actions
                </Typography>
                <Stack spacing={1}>
                  {data.status === 'TRIAL' && (
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" startIcon={<MoreTimeRoundedIcon />} disabled={update.isPending} onClick={() => extendTrial(15)}>
                        +15 days
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<MoreTimeRoundedIcon />} disabled={update.isPending} onClick={() => extendTrial(30)}>
                        +30 days
                      </Button>
                    </Stack>
                  )}
                  {data.status !== 'ACTIVE' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleRoundedIcon />}
                      disabled={update.isPending}
                      onClick={() => apply({ status: 'ACTIVE', note: 'Activated' }, `${data.name} is now active`)}
                    >
                      {data.status === 'SUSPENDED' ? 'Reactivate' : 'Activate paid plan'}
                    </Button>
                  )}
                  {data.status !== 'SUSPENDED' && (
                    <Button color="error" startIcon={<BlockRoundedIcon />} disabled={update.isPending} onClick={() => setConfirmSuspend(true)}>
                      Suspend access
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Modules" subheader={`${data.modules.length} of ${MODULES.length} enabled`} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  {MODULES.map((module) => {
                    const enabled = data.modules.includes(module.code);
                    return (
                      <Stack key={module.code} direction="row" spacing={1.25} alignItems="center" sx={{ opacity: enabled ? 1 : 0.5 }}>
                        {enabled ? <CheckCircleRoundedIcon color="success" fontSize="small" /> : <BlockRoundedIcon color="disabled" fontSize="small" />}
                        <Typography variant="body2" fontWeight={enabled ? 600 : 400}>
                          {module.name}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {managing && (
        <ManagePlanDialog
          institute={data}
          submitting={update.isPending}
          onClose={() => setManaging(false)}
          onSubmit={async (body) => {
            if (await apply(body, 'Plan updated')) setManaging(false);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmSuspend}
        destructive
        title={`Suspend ${data.name}?`}
        message="Everyone at this institute will be signed out of iSkool on their next request and cannot sign in again until you reactivate it. No data is deleted."
        confirmLabel="Suspend"
        loading={update.isPending}
        onClose={() => setConfirmSuspend(false)}
        onConfirm={async () => {
          if (await apply({ status: 'SUSPENDED', note: 'Suspended from console' }, `${data.name} suspended`)) setConfirmSuspend(false);
        }}
      />
    </>
  );
}

function ManagePlanDialog({
  institute,
  submitting,
  onClose,
  onSubmit,
}: {
  institute: PlatformInstituteDetail;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (body: SubscriptionUpdate) => Promise<void>;
}) {
  const [status, setStatus] = useState<InstituteStatus>(institute.status);
  const [trialEnds, setTrialEnds] = useState(toInputDate(institute.trialEndsAt) || toInputDate(dayjs().add(30, 'day').toDate()));
  const [modules, setModules] = useState<string[]>(institute.modules);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggle = (code: string) =>
    setModules((current) => (current.includes(code) ? current.filter((m) => m !== code) : [...current, code]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'TRIAL' && !trialEnds) return setError('Pick a trial end date');
    const body: SubscriptionUpdate = { note: note.trim() || undefined };
    if (status !== institute.status) body.status = status;
    if (status === 'TRIAL' && trialEnds !== toInputDate(institute.trialEndsAt)) body.trialEndsAt = dayjs(trialEnds).endOf('day').toISOString();
    const sorted = (list: string[]) => [...list].sort().join();
    if (sorted(modules) !== sorted(institute.modules)) body.modules = modules;
    if (!body.status && !body.trialEndsAt && !body.modules) return setError('Nothing has changed');
    setError(null);
    void onSubmit(body);
  };

  return (
    <FormDialog open title={`Manage plan · ${institute.name}`} submitLabel="Save changes" submitting={submitting} onClose={onClose} onSubmit={submit}>
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select fullWidth label="Status" value={status} onChange={(e) => setStatus(e.target.value as InstituteStatus)}>
            {(Object.keys(STATUS_LABELS) as InstituteStatus[]).map((key) => (
              <MenuItem key={key} value={key}>
                {STATUS_LABELS[key]}
              </MenuItem>
            ))}
          </TextField>
          {status === 'TRIAL' && (
            <TextField
              fullWidth
              type="date"
              label="Trial ends on"
              value={trialEnds}
              onChange={(e) => setTrialEnds(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: '8px !important' }}>
          Read-only lets the institute sign in and view data but blocks changes. Suspended blocks all access.
        </Typography>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Modules
          </Typography>
          <Grid container>
            {MODULES.map((module) => (
              <Grid item xs={12} sm={6} key={module.code}>
                <FormControlLabel
                  sx={{ alignItems: 'flex-start', m: 0, py: 0.5 }}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ mt: -0.5 }}
                      checked={module.code === 'M00_CORE' || modules.includes(module.code)}
                      disabled={module.code === 'M00_CORE'}
                      onChange={() => toggle(module.code)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {module.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {module.description}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <TextField
          label="Note (optional)"
          placeholder="e.g. Paid annual plan, invoice #1042"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          inputProps={{ maxLength: 500 }}
          helperText="Saved in the change history"
        />
      </Stack>
    </FormDialog>
  );
}

function History({ entries }: { entries: PlatformAuditEntry[] }) {
  return (
    <Stack spacing={2} divider={<Divider flexItem />}>
      {entries.map((entry) => (
        <Box key={entry.id}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>{describeChanges(entry)}</Stack>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, textAlign: 'right' }}>
              {formatDate(entry.at, 'D MMM YYYY, h:mm A')}
              <br />
              {entry.adminEmail}
            </Typography>
          </Stack>
          {entry.note && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontStyle: 'italic' }}>
              “{entry.note}”
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

function describeChanges(entry: PlatformAuditEntry): ReactNode[] {
  const lines: ReactNode[] = [];
  const { before, after } = entry;
  if ('status' in after) {
    lines.push(
      <Typography key="status" variant="body2">
        Status <b>{STATUS_LABELS[before.status as InstituteStatus] ?? String(before.status)}</b> →{' '}
        <b>{STATUS_LABELS[after.status as InstituteStatus] ?? String(after.status)}</b>
      </Typography>,
    );
  }
  if ('trialEndsAt' in after) {
    lines.push(
      <Typography key="trial" variant="body2">
        Trial end <b>{formatDate(before.trialEndsAt as string)}</b> → <b>{formatDate(after.trialEndsAt as string)}</b>
      </Typography>,
    );
  }
  if ('modules' in after) {
    const was = (before.modules as string[] | undefined) ?? [];
    const now = (after.modules as string[] | undefined) ?? [];
    const added = now.filter((m) => !was.includes(m)).map((m) => MODULE_NAMES[m] ?? m);
    const removed = was.filter((m) => !now.includes(m)).map((m) => MODULE_NAMES[m] ?? m);
    if (added.length) lines.push(<Typography key="added" variant="body2">Enabled <b>{added.join(', ')}</b></Typography>);
    if (removed.length) lines.push(<Typography key="removed" variant="body2">Disabled <b>{removed.join(', ')}</b></Typography>);
  }
  return lines.length ? lines : [<Typography key="none" variant="body2">{entry.action}</Typography>];
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} component="div" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}
