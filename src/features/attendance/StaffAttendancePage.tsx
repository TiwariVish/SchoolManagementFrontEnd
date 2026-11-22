import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useSaveStaffAttendanceDay, useStaffAttendanceDay, useStaffAttendanceSummary } from '@/api/hooks';
import type { AttendanceStatus, StaffAttendanceRow } from '@/api/types';
import { useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { LoadingButton } from '@/components/LoadingButton';
import { PageHeader } from '@/components/PageHeader';
import { SearchField } from '@/components/SearchField';
import { StatCard } from '@/components/StatCard';
import { titleCase } from '@/lib/format';
import { useNotify } from '@/lib/notify';

const STATUSES: { value: AttendanceStatus; label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }[] = [
  { value: 'PRESENT', label: 'Present', color: 'success' },
  { value: 'ABSENT', label: 'Absent', color: 'error' },
  { value: 'HALF_DAY', label: 'Half day', color: 'warning' },
  { value: 'LEAVE', label: 'Leave', color: 'info' },
  { value: 'HOLIDAY', label: 'Holiday', color: 'default' },
];

const CATEGORY_TABS = [
  { value: '', label: 'All staff' },
  { value: 'TEACHING', label: 'Teachers' },
  { value: 'NON_TEACHING', label: 'Unit / office staff' },
];

export function StaffAttendancePage() {
  const { can, labels } = useAuth();
  const canManage = can('attendance.manage');
  const notify = useNotify();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState(0);
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});

  const day = useStaffAttendanceDay(date, category || undefined);
  const summary = useStaffAttendanceSummary({
    from: dayjs(date).startOf('month').format('YYYY-MM-DD'),
    to: dayjs(date).endOf('month').format('YYYY-MM-DD'),
    category: category || undefined,
  });
  const save = useSaveStaffAttendanceDay();

  useEffect(() => {
    if (!day.data) return;
    const next: Record<string, AttendanceStatus> = {};
    for (const row of day.data.items) {
      if (row.status) next[row.employee.id] = row.status;
    }
    setDraft(next);
  }, [day.data]);

  const rows = useMemo(() => {
    const items = day.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((row) => `${row.employee.name} ${row.employee.employeeCode}`.toLowerCase().includes(q));
  }, [day.data, search]);

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const row of rows) next[row.employee.id] = status;
    setDraft((prev) => ({ ...prev, ...next }));
  };

  const dirtyCount = useMemo(() => {
    if (!day.data) return 0;
    return day.data.items.filter((row) => {
      const current = draft[row.employee.id] ?? null;
      return current && current !== row.status;
    }).length;
  }, [day.data, draft]);

  const onSave = async () => {
    const entries = Object.entries(draft).map(([employeeId, status]) => ({ employeeId, status }));
    if (!entries.length) {
      notify.error('Mark at least one staff member');
      return;
    }
    try {
      await save.mutateAsync({ date, entries });
      notify.success('Attendance saved');
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Staff attendance"
        subtitle={`Daily attendance for ${labels.teacher.toLowerCase()}s and unit / office staff.`}
        actions={
          canManage &&
          view === 0 && (
            <LoadingButton variant="contained" loading={save.isPending} onClick={() => void onSave()} disabled={!dirtyCount && !Object.keys(draft).length}>
              Save attendance
            </LoadingButton>
          )
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }} alignItems={{ sm: 'center' }}>
        <TextField
          type="date"
          size="small"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 180 }}
        />
        <Tabs
          value={category}
          onChange={(_e, v: string) => setCategory(v)}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0 } }}
        >
          {CATEGORY_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Stack>

      {view === 0 && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2}>
            <StatCard label="Present" value={day.data?.counts.present ?? 0} loading={day.isLoading} color="#10b981" />
          </Grid>
          <Grid item xs={6} md={2}>
            <StatCard label="Absent" value={day.data?.counts.absent ?? 0} loading={day.isLoading} color="#ef4444" />
          </Grid>
          <Grid item xs={6} md={2}>
            <StatCard label="Half day" value={day.data?.counts.halfDay ?? 0} loading={day.isLoading} color="#f59e0b" />
          </Grid>
          <Grid item xs={6} md={2}>
            <StatCard label="Leave" value={day.data?.counts.leave ?? 0} loading={day.isLoading} color="#0ea5e9" />
          </Grid>
          <Grid item xs={6} md={2}>
            <StatCard label="Holiday" value={day.data?.counts.holiday ?? 0} loading={day.isLoading} />
          </Grid>
          <Grid item xs={6} md={2}>
            <StatCard label="Unmarked" value={day.data?.counts.unmarked ?? 0} loading={day.isLoading} color="#64748b" />
          </Grid>
        </Grid>
      )}

      <Card>
        <Tabs value={view} onChange={(_e, v: number) => setView(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Mark today" />
          <Tab label="Month summary" />
        </Tabs>

        {view === 0 ? (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }} alignItems={{ sm: 'center' }}>
              <SearchField value={search} onChange={setSearch} placeholder="Name or employee code" />
              {canManage && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {STATUSES.map((s) => (
                    <Button key={s.value} size="small" variant="outlined" onClick={() => markAll(s.value)}>
                      All {s.label.toLowerCase()}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
            <DataTable<StaffAttendanceRow>
              rows={rows}
              loading={day.isLoading}
              rowKey={(row) => row.employee.id}
              empty={
                <EmptyState
                  icon={<EventAvailableRoundedIcon />}
                  title="No staff in this group"
                  description="Add teaching or unit staff first from Staff."
                />
              }
              columns={[
                {
                  key: 'staff',
                  header: 'Staff',
                  render: (row) => (
                    <Box>
                      <Typography fontWeight={600}>{row.employee.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.employee.employeeCode}
                        {row.employee.designation ? ` · ${row.employee.designation}` : ''}
                        {` · ${row.employee.category === 'TEACHING' ? 'Teacher' : 'Unit staff'}`}
                      </Typography>
                    </Box>
                  ),
                },
                {
                  key: 'status',
                  header: 'Attendance',
                  render: (row) =>
                    canManage ? (
                      <TextField
                        select
                        size="small"
                        value={draft[row.employee.id] ?? ''}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [row.employee.id]: e.target.value as AttendanceStatus }))
                        }
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="">
                          <em>Unmarked</em>
                        </MenuItem>
                        {STATUSES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : draft[row.employee.id] || row.status ? (
                      <Chip
                        size="small"
                        label={titleCase((draft[row.employee.id] ?? row.status) as string)}
                        color={STATUSES.find((s) => s.value === (draft[row.employee.id] ?? row.status))?.color ?? 'default'}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    ),
                },
              ]}
            />
          </>
        ) : (
          <DataTable
            rows={summary.data?.items}
            loading={summary.isLoading}
            rowKey={(row) => row.employee.id}
            empty={<EmptyState icon={<EventAvailableRoundedIcon />} title="No marks this month" description="Save daily attendance to build the month summary." />}
            columns={[
              {
                key: 'staff',
                header: 'Staff',
                render: (row) => (
                  <Box>
                    <Typography fontWeight={600}>{row.employee.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.employee.employeeCode} · {row.employee.category === 'TEACHING' ? 'Teacher' : 'Unit staff'}
                    </Typography>
                  </Box>
                ),
              },
              { key: 'present', header: 'Present', render: (row) => row.counts.PRESENT },
              { key: 'absent', header: 'Absent', render: (row) => row.counts.ABSENT },
              { key: 'half', header: 'Half day', hideBelow: 'sm', render: (row) => row.counts.HALF_DAY },
              { key: 'leave', header: 'Leave', hideBelow: 'sm', render: (row) => row.counts.LEAVE },
              { key: 'holiday', header: 'Holiday', hideBelow: 'md', render: (row) => row.counts.HOLIDAY },
              { key: 'marked', header: 'Marked days', render: (row) => row.markedDays },
            ]}
          />
        )}
      </Card>
    </>
  );
}
