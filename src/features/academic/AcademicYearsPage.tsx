import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useAcademicYearAction, useAcademicYears, useCreateAcademicYear } from '@/api/hooks';
import type { AcademicYear } from '@/api/types';
import { plural, useAuth } from '@/app/auth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { FormSwitch, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/states';
import { StatusChip } from '@/components/StatusChip';
import { formatDate } from '@/lib/format';
import { useNotify } from '@/lib/notify';

const schema = z
  .object({
    name: z.string().trim().min(2, 'e.g. 2027-28').max(20),
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
    makeCurrent: z.boolean(),
  })
  .refine((v) => dayjs(v.endDate).isAfter(dayjs(v.startDate)), { path: ['endDate'], message: 'Must be after the start date' });
type Values = z.infer<typeof schema>;

type Action = 'set-current' | 'close' | 'reopen';

export function AcademicYearsPage() {
  const { labels, can, me } = useAuth();
  const notify = useNotify();
  const { data: years, isLoading, error, refetch } = useAcademicYears();
  const action = useAcademicYearAction();
  const [creating, setCreating] = useState(false);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; year: AcademicYear } | null>(null);
  const [confirm, setConfirm] = useState<{ year: AcademicYear; action: Action } | null>(null);
  const canManage = can('academic.manage');

  const ask = (next: Action) => {
    if (menu) setConfirm({ year: menu.year, action: next });
    setMenu(null);
  };

  const run = async () => {
    if (!confirm) return;
    try {
      await action.mutateAsync({ id: confirm.year.id, action: confirm.action });
      notify.success(
        confirm.action === 'set-current' ? `${confirm.year.name} is now the current year` : confirm.action === 'close' ? `${confirm.year.name} closed` : `${confirm.year.name} reopened`,
      );
      setConfirm(null);
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <>
      <PageHeader
        title={plural(labels.academicYear)}
        subtitle="Each year holds its own sections, enrollments and teacher allocations. Close a year to lock it."
        actions={
          canManage && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
              New {labels.academicYear.toLowerCase()}
            </Button>
          )
        }
      />

      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {years?.length === 0 && (
        <Card>
          <EmptyState title={`No ${plural(labels.academicYear).toLowerCase()} yet`} />
        </Card>
      )}

      <Grid container spacing={2.5}>
        {years?.map((year) => {
          const current = year.id === me?.currentAcademicYearId;
          const total = dayjs(year.endDate).diff(year.startDate, 'day');
          const elapsed = Math.min(Math.max(dayjs().diff(year.startDate, 'day'), 0), total);
          return (
            <Grid item xs={12} sm={6} lg={4} key={year.id}>
              <Card sx={{ height: '100%', borderColor: current ? 'primary.main' : undefined, borderWidth: current ? 2 : 1 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h5">{year.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {formatDate(year.startDate)} – {formatDate(year.endDate)}
                      </Typography>
                    </Box>
                    {canManage && (
                      <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, year })} aria-label="Year actions">
                        <MoreVertRoundedIcon />
                      </IconButton>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    {current && <Chip size="small" color="primary" label="Current" />}
                    <StatusChip value={year.status} />
                  </Stack>
                  <Box sx={{ mt: 2.5, height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
                    <Box sx={{ width: `${total ? (elapsed / total) * 100 : 0}%`, height: '100%', bgcolor: current ? 'primary.main' : 'text.disabled' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                    {elapsed <= 0 ? 'Not started' : elapsed >= total ? 'Completed' : `${Math.round((elapsed / total) * 100)}% through the year`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {menu && menu.year.id !== me?.currentAcademicYearId && menu.year.status !== 'CLOSED' && (
          <MenuItem onClick={() => ask('set-current')}>
            <ListItemIcon>
              <EventAvailableRoundedIcon fontSize="small" />
            </ListItemIcon>
            Make current
          </MenuItem>
        )}
        {menu && menu.year.status !== 'CLOSED' && (
          <MenuItem onClick={() => ask('close')}>
            <ListItemIcon>
              <LockRoundedIcon fontSize="small" />
            </ListItemIcon>
            Close year
          </MenuItem>
        )}
        {menu && menu.year.status === 'CLOSED' && (
          <MenuItem onClick={() => ask('reopen')}>
            <ListItemIcon>
              <LockOpenRoundedIcon fontSize="small" />
            </ListItemIcon>
            Reopen year
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action === 'set-current' ? 'Make this the current year?' : confirm?.action === 'close' ? 'Close this year?' : 'Reopen this year?'}
        message={
          confirm?.action === 'set-current'
            ? `Everyone will see ${confirm.year.name} by default.`
            : confirm?.action === 'close'
              ? 'No one will be able to change sections, enrollments or allocations for this year until it is reopened.'
              : 'Changes to this year will be allowed again.'
        }
        destructive={confirm?.action === 'close'}
        confirmLabel={confirm?.action === 'set-current' ? 'Make current' : confirm?.action === 'close' ? 'Close year' : 'Reopen'}
        loading={action.isPending}
        onConfirm={run}
        onClose={() => setConfirm(null)}
      />

      {creating && <CreateYearDialog onClose={() => setCreating(false)} />}
    </>
  );
}

function CreateYearDialog({ onClose }: { onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const create = useCreateAcademicYear();
  const next = dayjs().month() >= 3 ? dayjs().year() + 1 : dayjs().year();
  const { control, handleSubmit, setError } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: `${next}-${String(next + 1).slice(-2)}`,
      startDate: `${next}-04-01`,
      endDate: `${next + 1}-03-31`,
      makeCurrent: false,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      notify.success(`${values.name} created`);
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title={`New ${labels.academicYear.toLowerCase()}`} onClose={onClose} onSubmit={submit} submitting={create.isPending} submitLabel="Create" maxWidth="xs">
      <Stack spacing={2.25}>
        <FormText control={control} name="name" label="Name" autoFocus />
        <FormText control={control} name="startDate" label="Starts on" type="date" InputLabelProps={{ shrink: true }} />
        <FormText control={control} name="endDate" label="Ends on" type="date" InputLabelProps={{ shrink: true }} />
        <FormSwitch control={control} name="makeCurrent" label="Make this the current year" />
      </Stack>
    </FormDialog>
  );
}
