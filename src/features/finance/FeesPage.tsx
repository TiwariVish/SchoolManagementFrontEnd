import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
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
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors, toApiError } from '@/api/errors';
import {
  useCollectFee,
  useFeeInvoices,
  useFeeStructures,
  useFeesOverview,
  useGenerateFeeInvoices,
  useSaveFeeStructure,
  useSections,
} from '@/api/hooks';
import type { FeeInvoice, FeeStructure } from '@/api/types';
import { useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { SearchField } from '@/components/SearchField';
import { StatCard } from '@/components/StatCard';
import { StatusChip } from '@/components/StatusChip';
import { formatDate, titleCase } from '@/lib/format';
import { useNotify } from '@/lib/notify';
import { useDebounce } from '@/lib/use-debounce';

const METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

const money = (n: number) =>
  n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function FeesPage() {
  const { can } = useAuth();
  const canManage = can('fees.manage');
  const overview = useFeesOverview();
  const [tab, setTab] = useState(0);
  const [structureForm, setStructureForm] = useState<FeeStructure | 'new' | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [collecting, setCollecting] = useState<FeeInvoice | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim());
  const invoices = useFeeInvoices({ q: q || undefined, status: status || undefined, page, limit: 25 });
  const structures = useFeeStructures();

  return (
    <>
      <PageHeader
        title="Fee collection"
        subtitle="Create fee plans, raise dues for students, and collect payments with receipts."
        actions={
          canManage && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setGenerateOpen(true)}>
                Raise dues
              </Button>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setStructureForm('new')}>
                Fee plan
              </Button>
            </Stack>
          )
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Outstanding" value={money(overview.data?.outstanding ?? 0)} loading={overview.isLoading} color="#f59e0b" icon={<PaymentsRoundedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Collected" value={money(overview.data?.collected ?? 0)} loading={overview.isLoading} color="#10b981" icon={<ReceiptLongRoundedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Due invoices" value={overview.data?.due ?? 0} loading={overview.isLoading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Partially paid" value={overview.data?.partial ?? 0} loading={overview.isLoading} color="#0ea5e9" />
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_e, v: number) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Collections" />
          <Tab label="Fee plans" />
        </Tabs>

        {tab === 0 && (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }}>
              <SearchField value={search} onChange={(v) => (setSearch(v), setPage(1))} placeholder="Student name or admission no" />
              <TextField select size="small" label="Status" value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))} sx={{ minWidth: 160 }}>
                <MenuItem value="">All</MenuItem>
                {['DUE', 'PARTIAL', 'PAID', 'CANCELLED'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {titleCase(s)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <DataTable<FeeInvoice>
              rows={invoices.data?.items}
              loading={invoices.isLoading}
              rowKey={(row) => row.id}
              pagination={invoices.data && { page, limit: 25, total: invoices.data.total, onPageChange: setPage }}
              empty={<EmptyState icon={<PaymentsRoundedIcon />} title="No fee dues yet" description="Create a fee plan, then use Raise dues for your students." />}
              columns={[
                {
                  key: 'student',
                  header: 'Student',
                  render: (row) => (
                    <Box>
                      <Typography fontWeight={600} variant="body2">
                        {row.student?.name ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.student?.admissionNo}
                      </Typography>
                    </Box>
                  ),
                },
                { key: 'title', header: 'Fee', render: (row) => row.title },
                { key: 'amount', header: 'Amount', render: (row) => money(row.amount) },
                { key: 'paid', header: 'Paid', hideBelow: 'sm', render: (row) => money(row.paidAmount) },
                { key: 'balance', header: 'Balance', render: (row) => money(row.balance) },
                { key: 'due', header: 'Due', hideBelow: 'md', render: (row) => (row.dueDate ? formatDate(row.dueDate) : '—') },
                { key: 'status', header: 'Status', render: (row) => <StatusChip value={row.status} /> },
                {
                  key: 'actions',
                  header: '',
                  align: 'right',
                  render: (row) =>
                    canManage && row.status !== 'PAID' && row.status !== 'CANCELLED' ? (
                      <Button size="small" variant="contained" onClick={() => setCollecting(row)}>
                        Collect
                      </Button>
                    ) : null,
                },
              ]}
            />
          </>
        )}

        {tab === 1 && (
          <DataTable<FeeStructure>
            rows={structures.data}
            loading={structures.isLoading}
            rowKey={(row) => row.id}
            onRowClick={canManage ? setStructureForm : undefined}
            empty={<EmptyState icon={<ReceiptLongRoundedIcon />} title="No fee plans" description="Add tuition, transport or exam fees." />}
            columns={[
              {
                key: 'name',
                header: 'Plan',
                render: (row) => (
                  <Box>
                    <Typography fontWeight={600}>{row.name}</Typography>
                    {row.code && (
                      <Typography variant="caption" color="text.secondary">
                        {row.code}
                      </Typography>
                    )}
                  </Box>
                ),
              },
              { key: 'amount', header: 'Amount', render: (row) => money(row.amount) },
              { key: 'frequency', header: 'Frequency', render: (row) => titleCase(row.frequency) },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <Chip size="small" label={row.isActive ? 'Active' : 'Inactive'} color={row.isActive ? 'success' : 'default'} />,
              },
            ]}
          />
        )}
      </Card>

      {structureForm && <FeeStructureDialog value={structureForm === 'new' ? null : structureForm} onClose={() => setStructureForm(null)} />}
      {generateOpen && <GenerateDuesDialog onClose={() => setGenerateOpen(false)} />}
      {collecting && <CollectDialog invoice={collecting} onClose={() => setCollecting(null)} />}
    </>
  );
}

function FeeStructureDialog({ value, onClose }: { value: FeeStructure | null; onClose: () => void }) {
  const notify = useNotify();
  const save = useSaveFeeStructure();
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2).max(120),
        code: z.string().trim().max(40).optional().or(z.literal('')),
        amount: z.coerce.number().min(0),
        frequency: z.enum(['ONE_TIME', 'MONTHLY', 'TERM', 'ANNUAL']),
        description: z.string().trim().max(240).optional().or(z.literal('')),
      }),
    [],
  );
  type Values = z.infer<typeof schema>;
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: value?.name ?? '',
      code: value?.code ?? '',
      amount: value?.amount ?? 0,
      frequency: value?.frequency ?? 'ONE_TIME',
      description: value?.description ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        id: value?.id,
        name: values.name,
        code: values.code || undefined,
        amount: values.amount,
        frequency: values.frequency,
        description: values.description || undefined,
      });
      notify.success(value ? 'Fee plan updated' : 'Fee plan created');
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(toApiError(err).message);
    }
  });

  return (
    <FormDialog open title={value ? 'Edit fee plan' : 'New fee plan'} submitLabel="Save" submitting={formState.isSubmitting} onClose={onClose} onSubmit={submit}>
      <Stack spacing={2}>
        <FormText control={control} name="name" label="Name" autoFocus />
        <FormText control={control} name="code" label="Code (optional)" />
        <FormText control={control} name="amount" label="Amount (₹)" type="number" />
        <FormSelect
          control={control}
          name="frequency"
          label="Frequency"
          options={[
            { value: 'ONE_TIME', label: 'One time' },
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'TERM', label: 'Term' },
            { value: 'ANNUAL', label: 'Annual' },
          ]}
        />
        <FormText control={control} name="description" label="Description" multiline minRows={2} />
      </Stack>
    </FormDialog>
  );
}

function GenerateDuesDialog({ onClose }: { onClose: () => void }) {
  const notify = useNotify();
  const generate = useGenerateFeeInvoices();
  const { data: structures = [] } = useFeeStructures();
  const { data: sections = [] } = useSections();
  const schema = z.object({
    feeStructureId: z.string().min(1, 'Pick a fee plan'),
    sectionId: z.string().optional().or(z.literal('')),
    dueDate: z.string().optional().or(z.literal('')),
  });
  type Values = z.infer<typeof schema>;
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { feeStructureId: '', sectionId: '', dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD') },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const result = await generate.mutateAsync({
        feeStructureId: values.feeStructureId,
        sectionId: values.sectionId || undefined,
        dueDate: values.dueDate || undefined,
      });
      notify.success(`Raised ${result.created} fee due${result.created === 1 ? '' : 's'}`);
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(toApiError(err).message);
    }
  });

  return (
    <FormDialog
      open
      title="Raise fee dues"
      description="Creates a due invoice for every active student (or one section) from the selected plan."
      submitLabel="Raise dues"
      submitting={formState.isSubmitting}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2}>
        <FormSelect
          control={control}
          name="feeStructureId"
          label="Fee plan"
          options={structures.filter((s) => s.isActive).map((s) => ({ value: s.id, label: `${s.name} · ${money(s.amount)}` }))}
        />
        <FormSelect
          control={control}
          name="sectionId"
          label="Section (optional)"
          emptyLabel="All students this year"
          options={sections.map((s) => ({ value: s.id, label: s.name }))}
        />
        <FormText control={control} name="dueDate" label="Due date" type="date" InputLabelProps={{ shrink: true }} />
      </Stack>
    </FormDialog>
  );
}

function CollectDialog({ invoice, onClose }: { invoice: FeeInvoice; onClose: () => void }) {
  const notify = useNotify();
  const collect = useCollectFee();
  const schema = z.object({
    amount: z.coerce.number().min(0.01).max(invoice.balance),
    method: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']),
    note: z.string().max(240).optional().or(z.literal('')),
  });
  type Values = z.infer<typeof schema>;
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { amount: invoice.balance, method: 'CASH', note: '' },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await collect.mutateAsync({ id: invoice.id, amount: values.amount, method: values.method, note: values.note || undefined });
      notify.success('Payment recorded');
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(toApiError(err).message);
    }
  });

  return (
    <FormDialog
      open
      title={`Collect · ${invoice.student?.name ?? 'Student'}`}
      description={`${invoice.title} · balance ${money(invoice.balance)}`}
      submitLabel="Record payment"
      submitting={formState.isSubmitting}
      onClose={onClose}
      onSubmit={submit}
    >
      <Stack spacing={2}>
        <FormText control={control} name="amount" label="Amount (₹)" type="number" autoFocus />
        <FormSelect control={control} name="method" label="Method" options={METHODS} />
        <FormText control={control} name="note" label="Note" multiline minRows={2} />
      </Stack>
    </FormDialog>
  );
}
