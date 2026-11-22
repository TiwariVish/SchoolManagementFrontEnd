import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { Box, Card, Chip, Grid, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlatformInstitutes, usePlatformOverview } from '@/api/platform';
import type { InstituteStatus, InstituteType, PlatformInstitute } from '@/api/types';
import { useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { SearchField } from '@/components/SearchField';
import { StatCard } from '@/components/StatCard';
import { formatDate } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { InstituteAvatar, STATUS_LABELS, SubscriptionStatus, TYPE_META } from './shared';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'trialEnding', label: 'Trial ending soonest' },
];

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

export function PlatformHomePage() {
  const { platformAdmin } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const overview = usePlatformOverview();

  const type = params.get('type') ?? '';
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Number(params.get('page') ?? 1);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const q = useDebounce(search.trim());

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if ((params.get('q') ?? '') !== q) update({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const limit = 25;
  const { data, isLoading, isFetching } = usePlatformInstitutes({ q: params.get('q') ?? '', type, status, sort, page, limit });
  const stats = overview.data;
  const filtered = Boolean(params.get('q') || type || status);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${platformAdmin?.name.split(' ')[0] ?? ''}`}
        subtitle="Every school, college and university using iSkool."
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Customers"
            value={stats?.institutes ?? 0}
            loading={overview.isLoading}
            icon={<BusinessRoundedIcon />}
            hint={stats ? `${stats.byType.SCHOOL} schools · ${stats.byType.COLLEGE} colleges · ${stats.byType.UNIVERSITY} universities` : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Paying"
            value={stats?.byStatus.ACTIVE ?? 0}
            loading={overview.isLoading}
            color="#10b981"
            icon={<BadgeRoundedIcon />}
            hint={stats ? `${stats.byStatus.TRIAL} on trial · ${stats.newThisMonth} joined in the last 30 days` : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Trials needing attention"
            value={(stats?.trialsEndingSoon ?? 0) + (stats?.trialsExpired ?? 0)}
            loading={overview.isLoading}
            color="#f59e0b"
            icon={<HourglassBottomRoundedIcon />}
            hint={stats ? `${stats.trialsEndingSoon} ending within 7 days · ${stats.trialsExpired} expired` : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Students on iSkool"
            value={(stats?.students ?? 0).toLocaleString('en-IN')}
            loading={overview.isLoading}
            color="#0ea5e9"
            icon={<GroupsRoundedIcon />}
            hint={stats ? `${stats.staff.toLocaleString('en-IN')} staff across all customers` : undefined}
          />
        </Grid>
      </Grid>

      <Card>
        <Tabs value={type} onChange={(_e, value: string) => update({ type: value })} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab value="" label={<TabLabel label="All" count={stats?.institutes} />} />
          {(Object.keys(TYPE_META) as InstituteType[]).map((key) => (
            <Tab key={key} value={key} label={<TabLabel label={TYPE_META[key].plural} count={stats?.byType[key]} />} />
          ))}
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }} alignItems={{ sm: 'center' }}>
          <SearchField value={search} onChange={setSearch} placeholder="Name, code, email or city" />
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => update({ status: e.target.value })}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {(Object.keys(STATUS_LABELS) as InstituteStatus[]).map((key) => (
              <MenuItem key={key} value={key}>
                {STATUS_LABELS[key]}
                {stats ? ` (${stats.byStatus[key]})` : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Sort" value={sort} onChange={(e) => update({ sort: e.target.value })} sx={{ minWidth: 190 }}>
            {SORTS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flex: 1 }} />
          {data && (
            <Typography variant="body2" color="text.secondary" sx={{ opacity: isFetching ? 0.5 : 1 }}>
              {data.total} {data.total === 1 ? 'institute' : 'institutes'}
            </Typography>
          )}
        </Stack>

        <DataTable<PlatformInstitute>
          rows={data?.items}
          loading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/platform/institutes/${row.id}`)}
          pagination={data && { page, limit, total: data.total, onPageChange: (next) => update({ page: String(next) }) }}
          empty={
            filtered ? (
              <EmptyState icon={<SearchOffRoundedIcon />} title="No institutes match" description="Try a different search or clear the filters." />
            ) : (
              <EmptyState
                icon={<BusinessRoundedIcon />}
                title="No customers yet"
                description="Institutes appear here as soon as they sign up at /register."
              />
            )
          }
          columns={[
            {
              key: 'name',
              header: 'Institute',
              render: (row) => (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <InstituteAvatar type={row.type} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {row.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                      {row.code}
                      {row.city ? ` · ${row.city}` : ''}
                    </Typography>
                  </Box>
                </Stack>
              ),
            },
            {
              key: 'type',
              header: 'Type',
              hideBelow: 'md',
              render: (row) => (
                <Chip size="small" label={TYPE_META[row.type].label} sx={{ fontWeight: 600, color: TYPE_META[row.type].color }} variant="outlined" />
              ),
            },
            { key: 'status', header: 'Plan', render: (row) => <SubscriptionStatus institute={row} /> },
            {
              key: 'owner',
              header: 'Admin contact',
              hideBelow: 'lg',
              render: (row) =>
                row.owner ? (
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {row.owner.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                      {row.owner.email}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>
                ),
            },
            {
              key: 'usage',
              header: 'Usage',
              hideBelow: 'sm',
              render: (row) => (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {row.usage.students.toLocaleString('en-IN')} students
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.usage.staff} staff · {row.usage.sections} sections
                  </Typography>
                </Box>
              ),
            },
            { key: 'joined', header: 'Joined', hideBelow: 'md', render: (row) => formatDate(row.createdAt) },
          ]}
        />
      </Card>
    </>
  );
}

function TabLabel({ label, count }: { label: string; count?: number }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <span>{label}</span>
      {count !== undefined && (
        <Box component="span" sx={{ px: 0.9, py: 0.1, borderRadius: 5, bgcolor: 'action.selected', fontSize: 12, fontWeight: 700 }}>
          {count}
        </Box>
      )}
    </Stack>
  );
}
