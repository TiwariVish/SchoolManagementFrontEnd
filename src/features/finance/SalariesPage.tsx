import { zodResolver } from '@hookform/resolvers/zod';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors, toApiError } from '@/api/errors';
import {
  usePaySalary,
  usePayrollOverview,
  useSalaryPayments,
  useSalaryProfiles,
  useUpsertSalaryProfile,
} from '@/api/hooks';
import type { SalaryPayment, SalaryProfileRow } from '@/api/types';
import { useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { SearchField } from '@/components/SearchField';
import { StatCard } from '@/components/StatCard';
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

const STAFF_TABS = [
  { value: '', label: 'All staff' },
  { value: 'TEACHING', label: 'Teachers' },
  { value: 'NON_TEACHING', label: 'Unit / office staff' },
];

export function SalariesPage() {
  const { can, labels } = useAuth();
  const canManage = can('payroll.manage');
  const overview = usePayrollOverview();
  const profiles = useSalaryProfiles();
  const [tab, setTab] = useState(0);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim());
  const payments = useSalaryPayments({ q: q || undefined, page, limit: 25 });
  const [editing, setEditing] = useState<SalaryProfileRow | null>(null);
  const [paying, setPaying] = useState<SalaryProfileRow | null>(null);

  const filteredProfiles = (profiles.data ?? []).filter((row) => {
    if (category && row.employee.category !== category) return false;
    if (!search.trim()) return true;
    const hay = `${row.employee.name} ${row.employee.employeeCode}`.toLowerCase();
    return hay.includes(search.trim().toLowerCase());
  });

  return (
    <>
      <PageHeader
        title="Salary allocation"
        subtitle={`Set and pay monthly salary for ${labels.teacher.toLowerCase()}s and unit / office staff.`}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            label={`Paid this month (${overview.data?.period ?? '—'})`}
            value={money(overview.data?.paidAmountThisMonth ?? 0)}
            loading={overview.isLoading}
            color="#10b981"
            icon={<PaymentsRoundedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Staff paid this month" value={overview.data?.paidThisMonth ?? 0} loading={overview.isLoading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            label="Staff with salary set"
            value={overview.data?.staffWithSalary ?? 0}
            loading={overview.isLoading}
            color="#0ea5e9"
            icon={<AccountBalanceWalletRoundedIcon />}
          />
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_e, v: number) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Salary allocation" />
          <Tab label="Payment history" />
        </Tabs>

        <Stack spacing={1.5} sx={{ p: 2 }}>
          {tab === 0 && (
            <Tabs
              value={category}
              onChange={(_e, v: string) => setCategory(v)}
              sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0 } }}
            >
              {STAFF_TABS.map((t) => (
                <Tab key={t.value} value={t.value} label={t.label} />
              ))}
            </Tabs>
          )}
          <SearchField value={search} onChange={(v) => (setSearch(v), setPage(1))} placeholder="Name or employee code" />
        </Stack>

        {tab === 0 ? (
          <DataTable<SalaryProfileRow>
            rows={filteredProfiles}
            loading={profiles.isLoading}
            rowKey={(row) => row.employee.id}
            empty={
              <EmptyState
                icon={<AccountBalanceWalletRoundedIcon />}
                title="No staff in this group"
                description="Add teachers or unit / office staff from Staff, then allocate salary here."
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
                key: 'salary',
                header: 'Monthly salary',
                render: (row) => (row.monthlyAmount > 0 ? money(row.monthlyAmount) : 'Not allocated'),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: (row) =>
                  canManage ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => setEditing(row)}>
                        Allocate
                      </Button>
                      <Button size="small" variant="contained" disabled={row.monthlyAmount <= 0} onClick={() => setPaying(row)}>
                        Pay
                      </Button>
                    </Stack>
                  ) : null,
              },
            ]}
          />
        ) : (
          <DataTable<SalaryPayment>
            rows={payments.data?.items}
            loading={payments.isLoading}
            rowKey={(row) => row.id}
            pagination={payments.data && { page, limit: 25, total: payments.data.total, onPageChange: setPage }}
            empty={<EmptyState icon={<PaymentsRoundedIcon />} title="No salary payments yet" description="Pay staff from the Salary setup tab." />}
            columns={[
              {
                key: 'staff',
                header: 'Staff',
                render: (row) => (
                  <Box>
                    <Typography fontWeight={600}>{row.employee?.name ?? '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.employee?.employeeCode}
                    </Typography>
                  </Box>
                ),
              },
              { key: 'period', header: 'Period', render: (row) => row.period },
              { key: 'amount', header: 'Amount', render: (row) => money(row.amount) },
              { key: 'method', header: 'Method', hideBelow: 'sm', render: (row) => titleCase(row.method) },
              { key: 'receipt', header: 'Receipt', hideBelow: 'md', render: (row) => row.receiptNo },
              { key: 'paidAt', header: 'Paid on', render: (row) => formatDate(row.paidAt) },
            ]}
          />
        )}
      </Card>

      {editing && <SalaryDialog row={editing} onClose={() => setEditing(null)} />}
      {paying && <PayDialog row={paying} onClose={() => setPaying(null)} />}
    </>
  );
}

function SalaryDialog({ row, onClose }: { row: SalaryProfileRow; onClose: () => void }) {
  const notify = useNotify();
  const save = useUpsertSalaryProfile();
  const schema = z.object({
    monthlyAmount: z.coerce.number().min(0),
    note: z.string().max(240).optional().or(z.literal('')),
  });
  type Values = z.infer<typeof schema>;
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { monthlyAmount: row.monthlyAmount || 0, note: row.note ?? '' },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        employeeId: row.employee.id,
        monthlyAmount: values.monthlyAmount,
        isActive: true,
        note: values.note || undefined,
      });
      notify.success('Salary updated');
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(toApiError(err).message);
    }
  });

  return (
    <FormDialog open title={`Salary · ${row.employee.name}`} submitLabel="Save" submitting={formState.isSubmitting} onClose={onClose} onSubmit={submit}>
      <Stack spacing={2}>
        <FormText control={control} name="monthlyAmount" label="Monthly salary (₹)" type="number" autoFocus />
        <FormText control={control} name="note" label="Note" multiline minRows={2} />
      </Stack>
    </FormDialog>
  );
}

function PayDialog({ row, onClose }: { row: SalaryProfileRow; onClose: () => void }) {
  const notify = useNotify();
  const pay = usePaySalary();
  const schema = z.object({
    period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM'),
    amount: z.coerce.number().min(0.01),
    method: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']),
    note: z.string().max(240).optional().or(z.literal('')),
  });
  type Values = z.infer<typeof schema>;
  const { control, handleSubmit, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      period: dayjs().format('YYYY-MM'),
      amount: row.monthlyAmount,
      method: 'BANK_TRANSFER',
      note: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await pay.mutateAsync({
        employeeId: row.employee.id,
        period: values.period,
        amount: values.amount,
        method: values.method,
        note: values.note || undefined,
      });
      notify.success('Salary payment recorded');
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(toApiError(err).message);
    }
  });

  return (
    <FormDialog open title={`Pay salary · ${row.employee.name}`} submitLabel="Record payment" submitting={formState.isSubmitting} onClose={onClose} onSubmit={submit}>
      <Stack spacing={2}>
        <FormText control={control} name="period" label="Month (YYYY-MM)" placeholder="2026-11" autoFocus />
        <FormText control={control} name="amount" label="Amount (₹)" type="number" />
        <FormSelect control={control} name="method" label="Method" options={METHODS} />
        <FormText control={control} name="note" label="Note" multiline minRows={2} />
      </Stack>
    </FormDialog>
  );
}
