import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAcademicYears, useStudent, useTransferStudent } from '@/api/hooks';
import type { Enrollment } from '@/api/types';
import { useAcademicYear } from '@/app/academic-year';
import { plural, useAuth } from '@/app/auth';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/states';
import { StatusChip } from '@/components/StatusChip';
import { colorFor, formatDate, fullName, initials, titleCase } from '@/lib/format';
import { useNotify } from '@/lib/notify';
import { useAcademicLookups } from '../academic/use-lookups';

export function StudentDetailPage() {
  const { id = '' } = useParams();
  const { labels, can } = useAuth();
  const { yearId, isClosed } = useAcademicYear();
  const { data, isLoading, error, refetch } = useStudent(id);
  const { data: years } = useAcademicYears();
  const lookups = useAcademicLookups();
  const [transferring, setTransferring] = useState<Enrollment | null>(null);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const { student, enrollments } = data;
  const name = fullName(student);
  const current = enrollments.find((e) => e.academicYearId === yearId && e.status === 'ACTIVE');
  const yearName = (yid: string) => years?.find((y) => y.id === yid)?.name ?? '—';

  return (
    <>
      <PageHeader title={name} breadcrumbs={[{ label: plural(labels.student), to: '/students' }, { label: name }]} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', pt: 4 }}>
              <Avatar sx={{ width: 88, height: 88, mx: 'auto', fontSize: 32, fontWeight: 700, bgcolor: colorFor(name) }}>{initials(name)}</Avatar>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {name}
              </Typography>
              <Typography color="text.secondary">{student.admissionNo}</Typography>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }}>
                <StatusChip value={student.status} />
                {current && <Chip size="small" color="primary" label={`${lookups.sectionName(current.sectionId)} · Roll ${current.rollNo}`} />}
              </Stack>
            </CardContent>
            <Divider />
            <CardContent>
              <Stack spacing={1.75}>
                <Info icon={<EventRoundedIcon />} label="Admitted" value={formatDate(student.admissionDate)} />
                <Info icon={<CakeRoundedIcon />} label="Date of birth" value={formatDate(student.dateOfBirth)} />
                <Info icon={<PhoneRoundedIcon />} label="Phone" value={student.phone ?? '—'} />
                <Info icon={<EmailRoundedIcon />} label="Email" value={student.email ?? '—'} />
                <Info icon={<span />} label="Gender" value={student.gender ? titleCase(student.gender) : '—'} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
            <Card>
              <CardHeader title={`${labels.guardian} contacts`} />
              <CardContent>
                <Grid container spacing={2}>
                  {student.guardians.map((g) => (
                    <Grid item xs={12} sm={6} key={`${g.name}-${g.phone}`}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700}>{g.name}</Typography>
                          {g.isPrimary && <Chip size="small" color="primary" variant="outlined" label="Primary" />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {titleCase(g.relation)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {g.phone}
                        </Typography>
                        {g.email && (
                          <Typography variant="body2" color="text.secondary">
                            {g.email}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Enrollment history" />
              <CardContent>
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {enrollments.map((e) => (
                    <Box key={e.id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Box>
                          <Typography fontWeight={700}>
                            {yearName(e.academicYearId)} · {lookups.levelLabel(e.levelId)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {e.academicYearId === yearId ? `${lookups.sectionName(e.sectionId)} · ` : ''}Roll {e.rollNo}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StatusChip value={e.status} />
                          {e.id === current?.id && can('students.manage') && !isClosed && (
                            <Button size="small" startIcon={<SwapHorizRoundedIcon />} onClick={() => setTransferring(e)}>
                              Change {labels.section.toLowerCase()}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                      {e.sectionHistory.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Moved {e.sectionHistory.length} time{e.sectionHistory.length > 1 ? 's' : ''}, last on {formatDate(e.sectionHistory.at(-1)?.to)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {transferring && <TransferDialog studentId={student.id} enrollment={transferring} onClose={() => setTransferring(null)} />}
    </>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ color: 'text.secondary', display: 'flex', width: 20, '& svg': { fontSize: 18 } }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary" sx={{ width: 110 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0 }} noWrap>
        {value}
      </Typography>
    </Stack>
  );
}

function TransferDialog({ studentId, enrollment, onClose }: { studentId: string; enrollment: Enrollment; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const lookups = useAcademicLookups();
  const transfer = useTransferStudent();
  const [target, setTarget] = useState('');
  const options = lookups.sections.filter((s) => s.levelId === enrollment.levelId && s.id !== enrollment.sectionId);

  return (
    <FormDialog
      open
      title={`Change ${labels.section.toLowerCase()}`}
      description={`Move to another ${labels.section.toLowerCase()} of ${lookups.levelName(enrollment.levelId)}. A new roll number is assigned.`}
      onClose={onClose}
      submitting={transfer.isPending}
      submitLabel="Move"
      maxWidth="xs"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!target) return;
        try {
          await transfer.mutateAsync({ id: studentId, toSectionId: target });
          notify.success(`Moved to ${lookups.sectionName(target)}`);
          onClose();
        } catch (err) {
          notify.error(err);
        }
      }}
    >
      <TextField select label={`New ${labels.section.toLowerCase()}`} value={target} onChange={(e) => setTarget(e.target.value)} helperText={options.length ? undefined : `No other ${plural(labels.section).toLowerCase()} in this ${labels.level.toLowerCase()}`}>
        {options.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {lookups.sectionName(s)}
          </MenuItem>
        ))}
      </TextField>
    </FormDialog>
  );
}
