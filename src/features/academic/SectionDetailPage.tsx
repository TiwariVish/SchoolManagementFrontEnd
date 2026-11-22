import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toApiError } from '@/api/errors';
import {
  useAssignTeacher,
  useAssignments,
  useEmployee,
  useGenerateOfferings,
  useOfferings,
  useSection,
  useSetClassTeacher,
  useStudents,
} from '@/api/hooks';
import type { CourseOffering, Employee, TeachingAssignment } from '@/api/types';
import { useAcademicYear } from '@/app/academic-year';
import { plural, useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmployeePicker } from '@/components/EmployeePicker';
import { EmptyState } from '@/components/EmptyState';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { PersonCell } from '@/components/PersonCell';
import { StatCard } from '@/components/StatCard';
import { ErrorState, LoadingState } from '@/components/states';
import { StatusChip } from '@/components/StatusChip';
import { fullName, titleCase } from '@/lib/format';
import { useNotify } from '@/lib/notify';
import { AdmitStudentDialog } from '../people/AdmitStudentDialog';
import { useAcademicLookups } from './use-lookups';

export function SectionDetailPage() {
  const { id = '' } = useParams();
  const { labels, can } = useAuth();
  const { isClosed } = useAcademicYear();
  const navigate = useNavigate();
  const notify = useNotify();
  const lookups = useAcademicLookups();
  const section = useSection(id);
  const offerings = useOfferings({ sectionId: id });
  const assignments = useAssignments({ sectionId: id });
  const students = useStudents({ sectionId: id, limit: 100 });
  const generate = useGenerateOfferings();
  const [tab, setTab] = useState(0);
  const [assignFor, setAssignFor] = useState<CourseOffering | null>(null);
  const [classTeacherOpen, setClassTeacherOpen] = useState(false);
  const [admitting, setAdmitting] = useState(false);

  const canAcademic = can('academic.manage') && !isClosed;
  const canTeaching = can('teaching.manage') && !isClosed;
  const canStudents = can('students.manage') && !isClosed;

  const byOffering = useMemo(() => {
    const map = new Map<string, TeachingAssignment[]>();
    assignments.data?.forEach((a) => map.set(a.offeringId.id, [...(map.get(a.offeringId.id) ?? []), a]));
    return map;
  }, [assignments.data]);

  const classTeacher = useEmployee(section.data?.classTeacherId, can('employees.read'));
  const classTeacherName = useMemo(() => {
    const teacher = classTeacher.data ?? assignments.data?.find((a) => a.employeeId.id === section.data?.classTeacherId)?.employeeId;
    return teacher ? fullName(teacher) : null;
  }, [classTeacher.data, assignments.data, section.data]);

  if (section.isLoading) return <LoadingState />;
  if (section.error || !section.data) return <ErrorState error={section.error} onRetry={section.refetch} />;

  const s = section.data;
  const title = `${lookups.levelLabel(s.levelId)} – ${s.name}`;
  const unassigned = (offerings.data ?? []).filter((o) => !byOffering.get(o.id)?.some((a) => a.role === 'PRIMARY')).length;
  const curriculumSize = lookups.levelById.get(s.levelId)?.curriculum.filter((c) => !c.isElective).length ?? 0;

  const runGenerate = async () => {
    try {
      const result = await generate.mutateAsync(id);
      notify.success(result.created ? `${result.created} ${plural(labels.subject).toLowerCase()} added from the curriculum` : 'Everything is already up to date');
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: plural(labels.section), to: '/sections' }, { label: title }]}
        subtitle={[s.room && `Room ${s.room}`, s.capacity && `Capacity ${s.capacity}`].filter(Boolean).join(' · ') || undefined}
        actions={
          canStudents && (
            <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => setAdmitting(true)}>
              Admit {labels.student.toLowerCase()}
            </Button>
          )
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard label={plural(labels.student)} value={students.data?.total ?? 0} loading={students.isLoading} icon={<GroupsRoundedIcon />} hint={s.capacity ? `of ${s.capacity} seats` : undefined} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label={plural(labels.subject)}
            value={offerings.data?.length ?? 0}
            loading={offerings.isLoading}
            icon={<MenuBookRoundedIcon />}
            color="#0ea5e9"
            hint={
              !offerings.data?.length
                ? `None added yet`
                : unassigned
                  ? `${unassigned} without a ${labels.teacher.toLowerCase()}`
                  : `All have a ${labels.teacher.toLowerCase()}`
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {labels.classTeacher}
              </Typography>
              <Box sx={{ mt: 1.5, minHeight: 40, display: 'flex', alignItems: 'center' }}>
                {s.classTeacherId ? (
                  <PersonCell name={classTeacherName ?? 'Assigned'} secondary={classTeacher.data?.employeeCode} />
                ) : (
                  <Typography color="warning.main" fontWeight={600}>
                    Not assigned
                  </Typography>
                )}
              </Box>
              {canTeaching && (
                <Button size="small" startIcon={<StarRoundedIcon />} onClick={() => setClassTeacherOpen(true)} sx={{ mt: 1, ml: -1 }}>
                  {s.classTeacherId ? 'Change' : 'Assign'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`${plural(labels.subject)} & ${plural(labels.teacher)}`} />
          <Tab label={`${plural(labels.student)} (${students.data?.total ?? 0})`} />
        </Tabs>

        {tab === 0 && (
          <>
            {canAcademic && (
              <Stack direction="row" spacing={1} sx={{ p: 2 }} justifyContent="flex-end">
                <Button startIcon={<AutoAwesomeRoundedIcon />} onClick={runGenerate} disabled={generate.isPending || curriculumSize === 0}>
                  Add {plural(labels.subject).toLowerCase()} from curriculum
                </Button>
              </Stack>
            )}
            {curriculumSize === 0 && canAcademic && (
              <Alert severity="info" sx={{ mx: 2, mb: 2 }}>
                The curriculum for this {labels.level.toLowerCase()} is empty. Set it under {plural(labels.program)} & {plural(labels.level)} first.
              </Alert>
            )}
            <DataTable
              rows={offerings.data}
              loading={offerings.isLoading}
              rowKey={(o) => o.id}
              columns={[
                {
                  key: 'subject',
                  header: labels.subject,
                  render: (o) => (
                    <Box>
                      <Typography fontWeight={600} variant="body2">
                        {o.subjectId.name}
                        {o.batch && <Chip size="small" label={`Batch ${o.batch}`} sx={{ ml: 1 }} />}
                        {o.isElective && <Chip size="small" variant="outlined" label="Elective" sx={{ ml: 1 }} />}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {o.subjectId.code}
                        {o.weeklyPeriods ? ` · ${o.weeklyPeriods} periods/week` : ''}
                        {o.sectionIds.length > 1 ? ` · Combined with ${o.sectionIds.filter((x) => x.id !== id).map((x) => x.name).join(', ')}` : ''}
                      </Typography>
                    </Box>
                  ),
                },
                {
                  key: 'teachers',
                  header: plural(labels.teacher),
                  render: (o) => {
                    const list = byOffering.get(o.id) ?? [];
                    if (!list.length) return <Chip size="small" color="warning" variant="outlined" label="Not assigned" />;
                    return (
                      <Stack spacing={1}>
                        {list.map((a) => (
                          <Stack key={a.id} direction="row" spacing={1} alignItems="center">
                            <PersonCell name={fullName(a.employeeId)} size={28} />
                            {a.role !== 'PRIMARY' && <StatusChip value={a.role} />}
                          </Stack>
                        ))}
                      </Stack>
                    );
                  },
                },
                {
                  key: 'actions',
                  header: '',
                  align: 'right',
                  render: (o) =>
                    canTeaching && (
                      <Button
                        size="small"
                        startIcon={byOffering.get(o.id)?.length ? <SwapHorizRoundedIcon /> : <AddRoundedIcon />}
                        onClick={() => setAssignFor(o)}
                      >
                        {byOffering.get(o.id)?.length ? 'Change' : 'Assign'}
                      </Button>
                    ),
                },
              ]}
              empty={
                <EmptyState
                  icon={<MenuBookRoundedIcon />}
                  title={`No ${plural(labels.subject).toLowerCase()} in this ${labels.section.toLowerCase()} yet`}
                  description={`Use "Add ${plural(labels.subject).toLowerCase()} from curriculum" to create them in one click.`}
                />
              }
            />
          </>
        )}

        {tab === 1 && (
          <DataTable
            rows={students.data?.items}
            loading={students.isLoading}
            rowKey={(e) => e.id}
            onRowClick={(e) => navigate(`/students/${e.studentId.id}`)}
            columns={[
              { key: 'roll', header: 'Roll', width: 70, render: (e) => <Typography fontWeight={700}>{e.rollNo}</Typography> },
              { key: 'name', header: labels.student, render: (e) => <PersonCell name={fullName(e.studentId)} secondary={e.studentId.admissionNo} /> },
              { key: 'gender', header: 'Gender', hideBelow: 'sm', render: (e) => (e.studentId.gender ? titleCase(e.studentId.gender) : '—') },
              {
                key: 'guardian',
                header: labels.guardian,
                hideBelow: 'md',
                render: (e) => {
                  const g = e.studentId.guardians.find((x) => x.isPrimary) ?? e.studentId.guardians[0];
                  return g ? `${g.name} · ${g.phone}` : '—';
                },
              },
            ]}
            empty={
              <EmptyState
                icon={<GroupsRoundedIcon />}
                title={`No ${plural(labels.student).toLowerCase()} yet`}
                action={canStudents && <Button variant="contained" onClick={() => setAdmitting(true)}>Admit {labels.student.toLowerCase()}</Button>}
              />
            }
          />
        )}
      </Card>

      {assignFor && <AssignTeacherDialog offering={assignFor} current={byOffering.get(assignFor.id) ?? []} onClose={() => setAssignFor(null)} />}
      {classTeacherOpen && <ClassTeacherDialog sectionId={id} hasCurrent={Boolean(s.classTeacherId)} onClose={() => setClassTeacherOpen(false)} />}
      {admitting && <AdmitStudentDialog defaultSectionId={id} onClose={() => setAdmitting(false)} />}
    </>
  );
}

function AssignTeacherDialog({ offering, current, onClose }: { offering: CourseOffering; current: TeachingAssignment[]; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const assign = useAssignTeacher();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [role, setRole] = useState<'PRIMARY' | 'CO_TEACHER' | 'LAB'>('PRIMARY');
  const [replace, setReplace] = useState(current.some((a) => a.role === 'PRIMARY'));
  const [error, setError] = useState<string>();
  const primary = current.find((a) => a.role === 'PRIMARY');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return setError(`Choose a ${labels.teacher.toLowerCase()}`);
    try {
      await assign.mutateAsync({ offeringId: offering.id, employeeId: employee.id, role, replaceExisting: role === 'PRIMARY' && replace });
      notify.success(`${fullName(employee)} now teaches ${offering.subjectId.name}`);
      onClose();
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.code === 'PRIMARY_ALREADY_ASSIGNED') setReplace(true);
      setError(apiError.message);
    }
  };

  return (
    <FormDialog open title={`Assign ${labels.teacher.toLowerCase()}`} description={offering.subjectId.name} onClose={onClose} onSubmit={submit} submitting={assign.isPending} submitLabel="Assign">
      <Stack spacing={2.25}>
        {primary && (
          <Alert severity="info">
            Currently taught by <b>{fullName(primary.employeeId)}</b>. Assigning a new primary {labels.teacher.toLowerCase()} hands the subject over and keeps the history.
          </Alert>
        )}
        <EmployeePicker value={employee} onChange={(v) => (setEmployee(v), setError(undefined))} label={labels.teacher} error={error} />
        <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <MenuItem value="PRIMARY">Primary {labels.teacher.toLowerCase()}</MenuItem>
          <MenuItem value="CO_TEACHER">Co-{labels.teacher.toLowerCase()}</MenuItem>
          <MenuItem value="LAB">Lab / practical</MenuItem>
        </TextField>
        {role === 'PRIMARY' && primary && (
          <FormControlLabel control={<Switch checked={replace} onChange={(e) => setReplace(e.target.checked)} />} label={`Replace ${fullName(primary.employeeId)}`} />
        )}
      </Stack>
    </FormDialog>
  );
}

function ClassTeacherDialog({ sectionId, hasCurrent, onClose }: { sectionId: string; hasCurrent: boolean; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const setClassTeacher = useSetClassTeacher();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string>();

  const save = async (employeeId: string | null) => {
    try {
      await setClassTeacher.mutateAsync({ sectionId, employeeId });
      notify.success(employeeId ? `${labels.classTeacher} assigned` : `${labels.classTeacher} removed`);
      onClose();
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <FormDialog
      open
      title={labels.classTeacher}
      description={`Each ${labels.teacher.toLowerCase()} can be ${labels.classTeacher.toLowerCase()} of only one ${labels.section.toLowerCase()} per year.`}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();
        if (!employee) return setError(`Choose a ${labels.teacher.toLowerCase()}`);
        void save(employee.id);
      }}
      submitting={setClassTeacher.isPending}
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <EmployeePicker value={employee} onChange={(v) => (setEmployee(v), setError(undefined))} label={labels.teacher} error={error} />
        {hasCurrent && (
          <Button color="error" onClick={() => save(null)} sx={{ alignSelf: 'flex-start' }}>
            Remove current {labels.classTeacher.toLowerCase()}
          </Button>
        )}
      </Stack>
    </FormDialog>
  );
}
