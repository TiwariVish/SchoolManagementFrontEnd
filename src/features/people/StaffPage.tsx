import { zodResolver } from '@hookform/resolvers/zod';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useCreateEmployee, useEmployees, useUpdateEmployee } from '@/api/hooks';
import type { CreatedEmployee, Employee } from '@/api/types';
import { plural, useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect, FormSwitch, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { PersonCell } from '@/components/PersonCell';
import { SearchField } from '@/components/SearchField';
import { StatusChip } from '@/components/StatusChip';
import { formatDate, fullName } from '@/lib/format';
import { useNotify } from '@/lib/notify';
import { useDebounce } from '@/lib/use-debounce';

const CATEGORY_TABS = [
  { value: '', label: 'All' },
  { value: 'TEACHING', label: 'Teaching' },
  { value: 'NON_TEACHING', label: 'Non-teaching' },
];

export function StaffPage() {
  const { labels, can } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [created, setCreated] = useState<CreatedEmployee | null>(null);
  const q = useDebounce(search);
  const { data, isLoading } = useEmployees({ q: q || undefined, category: category || undefined, page, limit: 25 });
  const adding = params.get('add') === '1';
  const canManage = can('employees.manage');

  const setAdding = (open: boolean) => setParams(open ? { add: '1' } : {}, { replace: true });

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${plural(labels.teacher)} and non-teaching staff. Create a login so they can see their own classes.`}
        actions={
          canManage && (
            <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => setAdding(true)}>
              Add staff
            </Button>
          )
        }
      />
      <Card>
        <Tabs
          value={category}
          onChange={(_e, v) => {
            setCategory(v);
            setPage(1);
          }}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {CATEGORY_TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>
        <Box sx={{ p: 2 }}>
          <SearchField
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Name, code or email"
          />
        </Box>
        <DataTable
          rows={data?.items}
          loading={isLoading}
          rowKey={(e) => e.id}
          onRowClick={canManage ? setEditing : undefined}
          pagination={data && { page, limit: data.limit, total: data.total, onPageChange: setPage }}
          columns={[
            { key: 'name', header: 'Name', render: (e) => <PersonCell name={fullName(e)} secondary={e.email ?? e.employeeCode} /> },
            { key: 'code', header: 'Code', hideBelow: 'sm', render: (e) => <Chip size="small" variant="outlined" label={e.employeeCode} /> },
            {
              key: 'role',
              header: 'Role',
              hideBelow: 'md',
              render: (e) => (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {e.designation ?? (e.category === 'TEACHING' ? labels.teacher : 'Staff')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {e.department ?? '—'}
                  </Typography>
                </Box>
              ),
            },
            { key: 'category', header: 'Type', hideBelow: 'lg', render: (e) => <StatusChip value={e.category} /> },
            {
              key: 'login',
              header: 'Login',
              hideBelow: 'md',
              render: (e) =>
                e.userId ? <Chip size="small" color="success" icon={<CheckCircleRoundedIcon />} label="Active" variant="outlined" /> : <Typography variant="body2" color="text.secondary">None</Typography>,
            },
            { key: 'status', header: 'Status', render: (e) => <StatusChip value={e.status} /> },
          ]}
          empty={
            <EmptyState
              icon={<BadgeRoundedIcon />}
              title={q || category ? 'No matching staff' : 'No staff yet'}
              description={q || category ? 'Try clearing the filters.' : `Add your ${plural(labels.teacher).toLowerCase()} so you can allocate ${plural(labels.subject).toLowerCase()} to them.`}
              action={!q && !category && canManage && <Button variant="contained" onClick={() => setAdding(true)}>Add staff</Button>}
            />
          }
        />
      </Card>

      {adding && (
        <AddStaffDialog
          onClose={() => setAdding(false)}
          onCreated={(result) => {
            setAdding(false);
            if (result.login?.temporaryPassword || result.login?.linkedExistingUser) setCreated(result);
          }}
        />
      )}
      {editing && <EditStaffDialog employee={editing} onClose={() => setEditing(null)} />}
      {created && <CredentialsDialog result={created} onClose={() => setCreated(null)} />}
    </>
  );
}

const optionalEmail = z.union([z.literal(''), z.string().trim().email('Invalid email')]).optional();

const addSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Required').max(60),
    lastName: z.string().trim().max(60).optional(),
    email: optionalEmail,
    phone: z.union([z.literal(''), z.string().regex(/^\+?[0-9]{7,15}$/, '7–15 digits')]).optional(),
    category: z.enum(['TEACHING', 'NON_TEACHING']),
    designation: z.string().trim().max(60).optional(),
    department: z.string().trim().max(60).optional(),
    joiningDate: z.string().optional(),
    createLogin: z.boolean(),
  })
  .refine((v) => !v.createLogin || Boolean(v.email), { path: ['email'], message: 'Email is required to create a login' });
type AddValues = z.infer<typeof addSchema>;

const blankToUndefined = <T extends Record<string, unknown>>(values: T) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]));

function AddStaffDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (result: CreatedEmployee) => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const create = useCreateEmployee();
  const { control, handleSubmit, setError } = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', category: 'TEACHING', designation: '', department: '', joiningDate: '', createLogin: true },
  });
  const createLogin = useWatch({ control, name: 'createLogin' });

  const submit = handleSubmit(async (values) => {
    try {
      const result = await create.mutateAsync(blankToUndefined(values));
      notify.success(`${fullName(result.employee)} added · ${result.employee.employeeCode}`);
      onCreated(result);
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title="Add staff" description="An employee code is generated automatically." onClose={onClose} onSubmit={submit} submitting={create.isPending} submitLabel="Add" maxWidth="md">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="firstName" label="First name" autoFocus />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="lastName" label="Last name" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="email" label="Email" type="email" helperText={createLogin ? 'Used to sign in' : undefined} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="phone" label="Phone" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormSelect control={control} name="category" label="Type" options={[{ value: 'TEACHING', label: `Teaching (${labels.teacher})` }, { value: 'NON_TEACHING', label: 'Non-teaching' }]} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormText control={control} name="designation" label="Designation" placeholder="e.g. PGT Mathematics" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormText control={control} name="department" label="Department" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormText control={control} name="joiningDate" label="Joining date" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
            <FormSwitch control={control} name="createLogin" label="Create a login for this person" />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 6 }}>
              A temporary password is shown once after saving. {labels.teacher}s get the {labels.teacher} role.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </FormDialog>
  );
}

function CredentialsDialog({ result, onClose }: { result: CreatedEmployee; onClose: () => void }) {
  const notify = useNotify();
  const login = result.login!;
  const copy = (text: string) => navigator.clipboard.writeText(text).then(() => notify.info('Copied'));

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Login ready for {fullName(result.employee)}</DialogTitle>
      <DialogContent>
        {login.linkedExistingUser ? (
          <Alert severity="info">This email already had an iSkool account. It now also has access to your institute with its existing password.</Alert>
        ) : (
          <Stack spacing={2}>
            <Alert severity="warning">Share these details securely. The password will not be shown again; they must change it at first sign-in.</Alert>
            {[
              { label: 'Email', value: login.email },
              { label: 'Temporary password', value: login.temporaryPassword ?? '' },
            ].map((field) => (
              <TextField
                key={field.label}
                label={field.label}
                value={field.value}
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: field.label === 'Email' ? undefined : 'monospace' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy">
                        <IconButton onClick={() => copy(field.value)} edge="end">
                          <ContentCopyRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const editSchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(60),
  lastName: z.string().trim().max(60).optional(),
  phone: z.union([z.literal(''), z.string().regex(/^\+?[0-9]{7,15}$/, '7–15 digits')]).optional(),
  designation: z.string().trim().max(60).optional(),
  department: z.string().trim().max(60).optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'EXITED']),
});
type EditValues = z.infer<typeof editSchema>;

function EditStaffDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const notify = useNotify();
  const update = useUpdateEmployee();
  const { control, handleSubmit, setError } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: employee.firstName,
      lastName: employee.lastName ?? '',
      phone: employee.phone ?? '',
      designation: employee.designation ?? '',
      department: employee.department ?? '',
      status: employee.status,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: employee.id, ...blankToUndefined(values) });
      notify.success('Staff details updated');
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog open title={fullName(employee)} description={`${employee.employeeCode}${employee.joiningDate ? ` · Joined ${formatDate(employee.joiningDate)}` : ''}`} onClose={onClose} onSubmit={submit} submitting={update.isPending}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="firstName" label="First name" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="lastName" label="Last name" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="phone" label="Phone" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormSelect
            control={control}
            name="status"
            label="Status"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ON_LEAVE', label: 'On leave' },
              { value: 'EXITED', label: 'Exited' },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="designation" label="Designation" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="department" label="Department" />
        </Grid>
      </Grid>
    </FormDialog>
  );
}
