import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import { Box, Button, Card, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useAssignments, useCreateSection } from '@/api/hooks';
import { useAcademicYear } from '@/app/academic-year';
import { plural, useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { PersonCell } from '@/components/PersonCell';
import { useNotify } from '@/lib/notify';
import { useAcademicLookups } from './use-lookups';

export function SectionsPage() {
  const { labels, can } = useAuth();
  const { isClosed, year } = useAcademicYear();
  const navigate = useNavigate();
  const lookups = useAcademicLookups();
  const { data: assignments } = useAssignments();
  const [levelId, setLevelId] = useState('');
  const [creating, setCreating] = useState(false);
  const canManage = can('academic.manage') && !isClosed;

  const teacherNames = useMemo(() => {
    const names = new Map<string, string>();
    assignments?.forEach((a) => names.set(a.employeeId.id, [a.employeeId.firstName, a.employeeId.lastName].filter(Boolean).join(' ')));
    return names;
  }, [assignments]);

  const subjectsBySection = useMemo(() => {
    const counts = new Map<string, number>();
    assignments?.forEach((a) => a.offeringId.sectionIds.forEach((s) => counts.set(s.id, (counts.get(s.id) ?? 0) + 1)));
    return counts;
  }, [assignments]);

  const rows = useMemo(
    () =>
      lookups.sections
        .filter((s) => !levelId || s.levelId === levelId)
        .sort(
          (a, b) =>
            (lookups.levelById.get(a.levelId)?.order ?? 0) - (lookups.levelById.get(b.levelId)?.order ?? 0) || a.name.localeCompare(b.name),
        ),
    [lookups, levelId],
  );

  return (
    <>
      <PageHeader
        title={plural(labels.section)}
        subtitle={`${plural(labels.section)} for ${year?.name ?? 'the selected year'}. Open one to allocate ${plural(labels.teacher).toLowerCase()} and manage ${plural(labels.student).toLowerCase()}.`}
        actions={
          canManage && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
              New {labels.section.toLowerCase()}
            </Button>
          )
        }
      />
      <Card>
        <Box sx={{ p: 2 }}>
          <TextField select size="small" label={labels.level} value={levelId} onChange={(e) => setLevelId(e.target.value)} sx={{ maxWidth: 260 }}>
            <MenuItem value="">All {plural(labels.level).toLowerCase()}</MenuItem>
            {lookups.levelOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <DataTable
          rows={rows}
          loading={lookups.loading}
          rowKey={(s) => s.id}
          onRowClick={(s) => navigate(`/sections/${s.id}`)}
          columns={[
            {
              key: 'name',
              header: labels.section,
              render: (s) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 36, height: 36, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff', fontWeight: 800 }}>
                    {s.name}
                  </Box>
                  <Typography fontWeight={600}>{lookups.levelLabel(s.levelId)}</Typography>
                </Stack>
              ),
            },
            {
              key: 'classTeacher',
              header: labels.classTeacher,
              render: (s) =>
                s.classTeacherId ? (
                  teacherNames.get(s.classTeacherId) ? (
                    <PersonCell name={teacherNames.get(s.classTeacherId) ?? ''} size={28} />
                  ) : (
                    <Chip size="small" color="success" variant="outlined" label="Assigned" />
                  )
                ) : (
                  <Chip size="small" color="warning" variant="outlined" label="Not assigned" />
                ),
            },
            { key: 'subjects', header: 'Allocations', hideBelow: 'md', render: (s) => subjectsBySection.get(s.id) ?? 0 },
            { key: 'room', header: 'Room', hideBelow: 'md', render: (s) => s.room ?? '—' },
            { key: 'capacity', header: 'Capacity', hideBelow: 'sm', align: 'right', render: (s) => s.capacity ?? 'Default' },
          ]}
          empty={
            <EmptyState
              icon={<ClassRoundedIcon />}
              title={`No ${plural(labels.section).toLowerCase()} yet`}
              description={`Create ${plural(labels.section).toLowerCase()} like "A" and "B" for each ${labels.level.toLowerCase()} in this year.`}
              action={canManage && <Button variant="contained" onClick={() => setCreating(true)}>Create {labels.section.toLowerCase()}</Button>}
            />
          }
        />
      </Card>
      {creating && <CreateSectionDialog defaultLevelId={levelId} onClose={() => setCreating(false)} onCreated={(id) => navigate(`/sections/${id}`)} />}
    </>
  );
}

const schema = z.object({
  levelId: z.string().min(1, 'Required'),
  name: z.string().trim().regex(/^[A-Za-z0-9-]{1,10}$/, 'Up to 10 letters or digits'),
  capacity: z.number().int().min(1).max(500).optional(),
  room: z.string().trim().max(30).optional(),
});
type Values = z.infer<typeof schema>;

function CreateSectionDialog({ defaultLevelId, onClose, onCreated }: { defaultLevelId: string; onClose: () => void; onCreated: (id: string) => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const lookups = useAcademicLookups();
  const create = useCreateSection();
  const { control, handleSubmit, setError } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { levelId: defaultLevelId, name: '', capacity: undefined, room: '' },
  });

  const submit = handleSubmit(async ({ room, ...values }) => {
    try {
      const section = await create.mutateAsync({ ...values, room: room || undefined });
      notify.success(`${lookups.levelName(values.levelId)} – ${section.name} created`);
      onCreated(section.id);
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title={`New ${labels.section.toLowerCase()}`} onClose={onClose} onSubmit={submit} submitting={create.isPending} submitLabel="Create" maxWidth="xs">
      <Stack spacing={2.25}>
        <FormSelect control={control} name="levelId" label={labels.level} options={lookups.levelOptions} />
        <FormText control={control} name="name" label="Name" placeholder="A" inputProps={{ style: { textTransform: 'uppercase' } }} autoFocus />
        <Stack direction="row" spacing={2}>
          <FormText control={control} name="capacity" label="Capacity" type="number" helperText="Blank = default" />
          <FormText control={control} name="room" label="Room" />
        </Stack>
      </Stack>
    </FormDialog>
  );
}
