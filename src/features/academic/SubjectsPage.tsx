import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { Avatar, Box, Button, Card, IconButton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useSaveSubject, useSubjects } from '@/api/hooks';
import type { Subject } from '@/api/types';
import { plural, useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect, FormSwitch, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { SearchField } from '@/components/SearchField';
import { StatusChip } from '@/components/StatusChip';
import { colorFor, titleCase } from '@/lib/format';
import { useNotify } from '@/lib/notify';
import { useDebounce } from '@/lib/use-debounce';

const TYPES = ['THEORY', 'PRACTICAL', 'THEORY_PRACTICAL', 'ACTIVITY'] as const;

export function SubjectsPage() {
  const { labels, can } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Subject | 'new' | null>(null);
  const q = useDebounce(search);
  const { data, isLoading } = useSubjects({ q: q || undefined, page, limit: 25 });
  const canManage = can('academic.manage');

  return (
    <>
      <PageHeader
        title={plural(labels.subject)}
        subtitle={`The master list of ${plural(labels.subject).toLowerCase()}. Add them to each ${labels.level.toLowerCase()} from its curriculum.`}
        actions={
          canManage && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing('new')}>
              New {labels.subject.toLowerCase()}
            </Button>
          )
        }
      />
      <Card>
        <Box sx={{ p: 2 }}>
          <SearchField value={search} onChange={(v) => (setSearch(v), setPage(1))} placeholder="Search by name or code" />
        </Box>
        <DataTable
          rows={data?.items}
          loading={isLoading}
          rowKey={(s) => s.id}
          onRowClick={canManage ? setEditing : undefined}
          pagination={data && { page, limit: data.limit, total: data.total, onPageChange: setPage }}
          columns={[
            {
              key: 'name',
              header: labels.subject,
              render: (s) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar variant="rounded" sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: alpha(colorFor(s.code), 0.14), color: colorFor(s.code) }}>
                    <MenuBookRoundedIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography fontWeight={600} variant="body2">
                      {s.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.code}
                    </Typography>
                  </Box>
                </Stack>
              ),
            },
            { key: 'type', header: 'Type', hideBelow: 'sm', render: (s) => titleCase(s.type).replace('Theory Practical', 'Theory + Practical') },
            { key: 'credits', header: 'Credits', hideBelow: 'md', render: (s) => s.credits ?? '—' },
            { key: 'status', header: 'Status', render: (s) => <StatusChip value={s.isActive ? 'ACTIVE' : 'EXITED'} label={s.isActive ? 'Active' : 'Inactive'} /> },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (s) =>
                canManage && (
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={(e) => (e.stopPropagation(), setEditing(s))}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
            },
          ]}
          empty={
            <EmptyState
              icon={<MenuBookRoundedIcon />}
              title={q ? 'No matches' : `No ${plural(labels.subject).toLowerCase()} yet`}
              description={q ? 'Try a different search.' : 'Start with the subjects your institute teaches, e.g. Mathematics, English, Physics.'}
              action={!q && canManage && <Button variant="contained" onClick={() => setEditing('new')}>Add {labels.subject.toLowerCase()}</Button>}
            />
          }
        />
      </Card>
      {editing && <SubjectDialog subject={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

const schema = z.object({
  name: z.string().trim().min(1, 'Required').max(100),
  code: z.string().trim().regex(/^[A-Za-z0-9_-]{1,15}$/, 'Up to 15 letters, digits, - or _'),
  type: z.enum(TYPES),
  credits: z.number().int().min(0).max(40).optional(),
  isActive: z.boolean(),
});
type Values = z.infer<typeof schema>;

function SubjectDialog({ subject, onClose }: { subject: Subject | null; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const save = useSaveSubject();
  const { control, handleSubmit, setError } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: subject
      ? { name: subject.name, code: subject.code, type: subject.type, credits: subject.credits, isActive: subject.isActive }
      : { name: '', code: '', type: 'THEORY', credits: undefined, isActive: true },
  });

  const submit = handleSubmit(async ({ code, isActive, ...values }) => {
    try {
      await save.mutateAsync(subject ? { id: subject.id, ...values, isActive } : { ...values, code });
      notify.success(subject ? `${values.name} updated` : `${values.name} created`);
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title={subject ? `Edit ${labels.subject.toLowerCase()}` : `New ${labels.subject.toLowerCase()}`} onClose={onClose} onSubmit={submit} submitting={save.isPending} maxWidth="xs">
      <Stack spacing={2.25}>
        <FormText control={control} name="name" label="Name" autoFocus />
        <FormText control={control} name="code" label="Code" disabled={Boolean(subject)} helperText={subject ? 'Codes cannot be changed' : 'e.g. MATH, PHY101'} />
        <FormSelect control={control} name="type" label="Type" options={TYPES.map((t) => ({ value: t, label: titleCase(t).replace('Theory Practical', 'Theory + Practical') }))} />
        <FormText control={control} name="credits" label="Credits (optional)" type="number" />
        {subject && <FormSwitch control={control} name="isActive" label="Active" />}
      </Stack>
    </FormDialog>
  );
}
