import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import { Box, Card, Chip, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAssignments, useEndAssignment } from '@/api/hooks';
import type { TeachingAssignment } from '@/api/types';
import { useAcademicYear } from '@/app/academic-year';
import { plural, useAuth } from '@/app/auth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { PersonCell } from '@/components/PersonCell';
import { SearchField } from '@/components/SearchField';
import { StatusChip } from '@/components/StatusChip';
import { formatDate, fullName } from '@/lib/format';
import { useNotify } from '@/lib/notify';
import { useAcademicLookups } from '../academic/use-lookups';

export function AllocationPage() {
  const { labels, can } = useAuth();
  const { isClosed } = useAcademicYear();
  const notify = useNotify();
  const lookups = useAcademicLookups();
  const [sectionId, setSectionId] = useState('');
  const [search, setSearch] = useState('');
  const [ending, setEnding] = useState<TeachingAssignment | null>(null);
  const { data, isLoading } = useAssignments({ sectionId: sectionId || undefined });
  const end = useEndAssignment();
  const canManage = can('teaching.manage') && !isClosed;

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? [])
      .filter((a) => !term || `${fullName(a.employeeId)} ${a.employeeId.employeeCode} ${a.offeringId.subjectId.name}`.toLowerCase().includes(term))
      .sort((a, b) => fullName(a.employeeId).localeCompare(fullName(b.employeeId)));
  }, [data, search]);

  const teacherCount = new Set((data ?? []).map((a) => a.employeeId.id)).size;

  return (
    <>
      <PageHeader
        title={`${labels.teacher} allocation`}
        subtitle={`${data?.length ?? 0} allocations across ${teacherCount} ${plural(labels.teacher).toLowerCase()}. Assign ${plural(labels.teacher).toLowerCase()} from a ${labels.section.toLowerCase()} page.`}
      />
      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <SearchField value={search} onChange={setSearch} placeholder={`${labels.teacher} or ${labels.subject.toLowerCase()}`} />
          <TextField select size="small" label={labels.section} value={sectionId} onChange={(e) => setSectionId(e.target.value)} sx={{ minWidth: 220, maxWidth: { sm: 260 } }}>
            <MenuItem value="">All {plural(labels.section).toLowerCase()}</MenuItem>
            {lookups.sectionOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <DataTable
          rows={rows}
          loading={isLoading}
          rowKey={(a) => a.id}
          columns={[
            { key: 'teacher', header: labels.teacher, render: (a) => <PersonCell name={fullName(a.employeeId)} secondary={a.employeeId.employeeCode} /> },
            {
              key: 'subject',
              header: labels.subject,
              render: (a) => (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {a.offeringId.subjectId.name}
                    {a.offeringId.batch && ` · Batch ${a.offeringId.batch}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.offeringId.subjectId.code}
                  </Typography>
                </Box>
              ),
            },
            {
              key: 'sections',
              header: labels.section,
              render: (a) => (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {a.offeringId.sectionIds.map((s) => (
                    <Chip key={s.id} size="small" label={lookups.sectionName(s)} component={RouterLink} to={`/sections/${s.id}`} clickable />
                  ))}
                </Stack>
              ),
            },
            { key: 'role', header: 'Role', hideBelow: 'sm', render: (a) => <StatusChip value={a.role} /> },
            { key: 'since', header: 'Since', hideBelow: 'md', render: (a) => formatDate(a.startDate) },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (a) =>
                canManage && (
                  <Tooltip title="End allocation">
                    <IconButton size="small" onClick={() => setEnding(a)}>
                      <LinkOffRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
            },
          ]}
          empty={
            <EmptyState
              icon={<AssignmentIndRoundedIcon />}
              title="No allocations yet"
              description={`Open a ${labels.section.toLowerCase()} and assign a ${labels.teacher.toLowerCase()} to each ${labels.subject.toLowerCase()}.`}
            />
          }
        />
      </Card>
      <ConfirmDialog
        open={Boolean(ending)}
        title="End this allocation?"
        message={ending && `${fullName(ending.employeeId)} will stop teaching ${ending.offeringId.subjectId.name} from today. The history is kept.`}
        confirmLabel="End allocation"
        destructive
        loading={end.isPending}
        onClose={() => setEnding(null)}
        onConfirm={async () => {
          if (!ending) return;
          try {
            await end.mutateAsync(ending.id);
            notify.success('Allocation ended');
            setEnding(null);
          } catch (err) {
            notify.error(err);
          }
        }}
      />
    </>
  );
}
