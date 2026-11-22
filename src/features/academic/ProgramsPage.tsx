import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useCreateLevel, useCreateProgram, useLevels, usePrograms, useSetCurriculum, useSubjects } from '@/api/hooks';
import type { Level, Program } from '@/api/types';
import { plural, useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/states';
import { useNotify } from '@/lib/notify';

export function ProgramsPage() {
  const { labels, can } = useAuth();
  const { data: programs, isLoading } = usePrograms();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<'program' | 'level' | null>(null);
  const [curriculumFor, setCurriculumFor] = useState<Level | null>(null);
  const canManage = can('academic.manage');

  const selected = programs?.find((p) => p.id === selectedId) ?? programs?.[0];
  const { data: levels, isLoading: levelsLoading } = useLevels(selected?.id);
  const showProgramList = (programs?.length ?? 0) > 1 || !programs?.[0]?.isDefault;

  return (
    <>
      <PageHeader
        title={showProgramList ? `${plural(labels.program)} & ${plural(labels.level)}` : plural(labels.level)}
        subtitle={`Define the ${plural(labels.level).toLowerCase()} you run and the ${plural(labels.subject).toLowerCase()} taught in each.`}
        actions={
          canManage && (
            <>
              <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setDialog('program')}>
                New {labels.program.toLowerCase()}
              </Button>
              {selected && (
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog('level')}>
                  New {labels.level.toLowerCase()}
                </Button>
              )}
            </>
          )
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : !programs?.length ? (
        <Card>
          <EmptyState
            title={`No ${plural(labels.program).toLowerCase()} yet`}
            description={`Create a ${labels.program.toLowerCase()} such as B.Com or BCA. You can generate its ${plural(labels.level).toLowerCase()} automatically.`}
            action={canManage && <Button variant="contained" onClick={() => setDialog('program')}>Create {labels.program.toLowerCase()}</Button>}
          />
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {showProgramList && (
            <Grid item xs={12} md={4} lg={3}>
              <Card>
                <CardHeader title={plural(labels.program)} />
                <List sx={{ p: 1 }}>
                  {programs.map((program) => (
                    <ListItemButton key={program.id} selected={program.id === selected?.id} onClick={() => setSelectedId(program.id)}>
                      <ListItemText
                        primary={program.name}
                        secondary={[program.code, program.department].filter(Boolean).join(' · ')}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={showProgramList ? 8 : 12} lg={showProgramList ? 9 : 12}>
            <Card>
              <CardHeader title={selected?.isDefault ? plural(labels.level) : selected?.name} subheader={`${levels?.length ?? 0} ${plural(labels.level).toLowerCase()}`} />
              <Box sx={{ mt: 2 }}>
                <DataTable
                  rows={levels}
                  loading={levelsLoading}
                  rowKey={(l) => l.id}
                  onRowClick={canManage ? setCurriculumFor : undefined}
                  columns={[
                    { key: 'order', header: '#', width: 56, render: (l) => <Typography color="text.secondary">{l.order}</Typography> },
                    { key: 'name', header: labels.level, render: (l) => <Typography fontWeight={600}>{l.name}</Typography> },
                    { key: 'code', header: 'Code', hideBelow: 'sm', render: (l) => <Chip size="small" variant="outlined" label={l.code} /> },
                    {
                      key: 'curriculum',
                      header: plural(labels.subject),
                      render: (l) =>
                        l.curriculum.length ? (
                          <Typography variant="body2">
                            {l.curriculum.filter((c) => !c.isElective).length} core
                            {l.curriculum.some((c) => c.isElective) && ` · ${l.curriculum.filter((c) => c.isElective).length} elective`}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="warning.main" fontWeight={600}>
                            Not set
                          </Typography>
                        ),
                    },
                    {
                      key: 'actions',
                      header: '',
                      align: 'right',
                      render: (l) =>
                        canManage && (
                          <Button size="small" startIcon={<EditNoteRoundedIcon />} onClick={(e) => (e.stopPropagation(), setCurriculumFor(l))}>
                            Curriculum
                          </Button>
                        ),
                    },
                  ]}
                  empty={<EmptyState compact title={`No ${plural(labels.level).toLowerCase()} in this ${labels.program.toLowerCase()}`} />}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {dialog === 'program' && <ProgramDialog onClose={() => setDialog(null)} onCreated={(p) => setSelectedId(p.id)} />}
      {dialog === 'level' && selected && <LevelDialog program={selected} nextOrder={(levels?.length ?? 0) + 1} onClose={() => setDialog(null)} />}
      {curriculumFor && <CurriculumDialog level={curriculumFor} onClose={() => setCurriculumFor(null)} />}
    </>
  );
}

const programSchema = z.object({
  name: z.string().trim().min(2, 'Required'),
  code: z.string().trim().regex(/^[A-Za-z0-9_-]{1,15}$/, 'Up to 15 letters, digits, - or _'),
  department: z.string().trim().max(60).optional(),
  levelCount: z.number().int().min(0).max(20).optional(),
  levelPrefix: z.string().trim().max(30).optional(),
});
type ProgramValues = z.infer<typeof programSchema>;

function ProgramDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Program) => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const create = useCreateProgram();
  const { control, handleSubmit, setError } = useForm<ProgramValues>({
    resolver: zodResolver(programSchema),
    defaultValues: { name: '', code: '', department: '', levelCount: 6, levelPrefix: labels.level },
  });

  const submit = handleSubmit(async ({ levelCount, department, ...values }) => {
    try {
      const program = await create.mutateAsync({ ...values, department: department || undefined, levelCount: levelCount || undefined });
      notify.success(`${program.name} created`);
      onCreated(program);
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title={`New ${labels.program.toLowerCase()}`} onClose={onClose} onSubmit={submit} submitting={create.isPending} submitLabel="Create">
      <Stack spacing={2.25}>
        <FormText control={control} name="name" label="Name" placeholder="Bachelor of Computer Applications" autoFocus />
        <Stack direction="row" spacing={2}>
          <FormText control={control} name="code" label="Code" placeholder="BCA" />
          <FormText control={control} name="department" label="Department (optional)" />
        </Stack>
        <Typography variant="subtitle2" sx={{ pt: 1 }}>
          Generate {plural(labels.level).toLowerCase()} automatically
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormText control={control} name="levelCount" label="How many" type="number" helperText="0 to skip" />
          <FormText control={control} name="levelPrefix" label="Name prefix" helperText={`e.g. "${labels.level} 1"`} />
        </Stack>
      </Stack>
    </FormDialog>
  );
}

const levelSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(50),
  code: z.string().trim().regex(/^[A-Za-z0-9_-]{1,15}$/, 'Up to 15 letters, digits, - or _'),
  order: z.number({ invalid_type_error: 'Required' }).int().min(0),
});
type LevelValues = z.infer<typeof levelSchema>;

function LevelDialog({ program, nextOrder, onClose }: { program: Program; nextOrder: number; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const create = useCreateLevel();
  const { control, handleSubmit, setError } = useForm<LevelValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: { name: '', code: '', order: nextOrder },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({ ...values, programId: program.id });
      notify.success(`${values.name} added`);
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title={`New ${labels.level.toLowerCase()}`} description={program.isDefault ? undefined : program.name} onClose={onClose} onSubmit={submit} submitting={create.isPending} submitLabel="Add" maxWidth="xs">
      <Stack spacing={2.25}>
        <FormText control={control} name="name" label="Name" autoFocus />
        <FormText control={control} name="code" label="Code" />
        <FormText control={control} name="order" label="Display order" type="number" />
      </Stack>
    </FormDialog>
  );
}

interface Row {
  checked: boolean;
  isElective: boolean;
  weeklyPeriods: number;
}

function CurriculumDialog({ level, onClose }: { level: Level; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const save = useSetCurriculum();
  const { data: subjects, isLoading } = useSubjects({ limit: 100 });
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setRows(
      Object.fromEntries(level.curriculum.map((c) => [c.subjectId, { checked: true, isElective: c.isElective, weeklyPeriods: c.weeklyPeriods }])),
    );
  }, [level]);

  const visible = useMemo(
    () =>
      (subjects?.items ?? [])
        .filter((s) => s.isActive || rows[s.id]?.checked)
        .filter((s) => !filter || `${s.name} ${s.code}`.toLowerCase().includes(filter.toLowerCase())),
    [subjects, rows, filter],
  );
  const selectedCount = Object.values(rows).filter((r) => r.checked).length;

  const update = (id: string, patch: Partial<Row>) =>
    setRows((current) => ({ ...current, [id]: { ...(current[id] ?? { checked: false, isElective: false, weeklyPeriods: 0 }), ...patch } }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        levelId: level.id,
        items: Object.entries(rows)
          .filter(([, r]) => r.checked)
          .map(([subjectId, r]) => ({ subjectId, isElective: r.isElective, weeklyPeriods: r.weeklyPeriods })),
      });
      notify.success(`Curriculum for ${level.name} saved`);
      onClose();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <FormDialog
      open
      title={`Curriculum · ${level.name}`}
      description={`Pick the ${plural(labels.subject).toLowerCase()} taught in this ${labels.level.toLowerCase()}. Core subjects are added to every ${labels.section.toLowerCase()} automatically.`}
      onClose={onClose}
      onSubmit={submit}
      submitting={save.isPending}
      submitLabel={`Save (${selectedCount})`}
      maxWidth="md"
    >
      {isLoading ? (
        <LoadingState height={200} />
      ) : !subjects?.items.length ? (
        <EmptyState compact title={`No ${plural(labels.subject).toLowerCase()} yet`} description={`Create ${plural(labels.subject).toLowerCase()} first, then come back here.`} />
      ) : (
        <>
          <TextField size="small" placeholder={`Filter ${plural(labels.subject).toLowerCase()}…`} value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>{labels.subject}</TableCell>
                <TableCell align="center">Elective</TableCell>
                <TableCell align="right" width={140}>
                  Periods / week
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((subject) => {
                const row = rows[subject.id];
                return (
                  <TableRow key={subject.id} hover selected={row?.checked}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={Boolean(row?.checked)} onChange={(e) => update(subject.id, { checked: e.target.checked })} />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} variant="body2">
                        {subject.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subject.code}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" disabled={!row?.checked} checked={Boolean(row?.isElective)} onChange={(e) => update(subject.id, { isElective: e.target.checked })} />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        disabled={!row?.checked}
                        value={row?.weeklyPeriods ?? 0}
                        onChange={(e) => update(subject.id, { weeklyPeriods: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })}
                        inputProps={{ min: 0, max: 60, style: { textAlign: 'right' } }}
                        sx={{ width: 90 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </FormDialog>
  );
}
