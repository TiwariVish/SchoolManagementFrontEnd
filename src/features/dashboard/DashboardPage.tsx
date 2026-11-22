import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { Link as RouterLink } from 'react-router-dom';
import { useAssignments, useEmployees, useLevels, useSections, useStudents, useSubjects } from '@/api/hooks';
import { useAcademicYear } from '@/app/academic-year';
import { plural, useAuth } from '@/app/auth';
import { StatCard } from '@/components/StatCard';
import { MyClassesView } from '../teaching/MyClassesPage';

function greeting() {
  const hour = dayjs().hour();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export function DashboardPage() {
  const { me, can } = useAuth();
  const firstName = me?.user.name.split(' ')[0] ?? '';

  if (can('academic.manage')) return <AdminDashboard firstName={firstName} />;

  return (
    <>
      <Typography variant="h4">
        {greeting()}, {firstName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        {me?.profile?.type === 'EMPLOYEE' ? 'Here is what you are teaching this year.' : `Welcome to ${me?.institute.name}.`}
      </Typography>
      {me?.profile?.type === 'EMPLOYEE' && <MyClassesView />}
    </>
  );
}

function AdminDashboard({ firstName }: { firstName: string }) {
  const { labels, can, me } = useAuth();
  const { year } = useAcademicYear();
  const students = useStudents({ limit: 1 });
  const staff = useEmployees({ limit: 1 });
  const subjects = useSubjects({ limit: 1 });
  const sections = useSections();
  const levels = useLevels();
  const assignments = useAssignments();

  const steps = [
    { label: `Add ${plural(labels.subject).toLowerCase()}`, done: (subjects.data?.total ?? 0) > 0, to: '/subjects' },
    {
      label: `Set the curriculum for each ${labels.level.toLowerCase()}`,
      done: (levels.data ?? []).some((l) => l.curriculum.length > 0),
      to: '/programs',
    },
    { label: `Create ${plural(labels.section).toLowerCase()}`, done: (sections.data?.length ?? 0) > 0, to: '/sections' },
    { label: 'Add teaching staff', done: (staff.data?.total ?? 0) > 0, to: '/staff' },
    { label: `Allocate ${plural(labels.teacher).toLowerCase()}`, done: (assignments.data?.length ?? 0) > 0, to: '/allocation' },
    { label: `Admit ${plural(labels.student).toLowerCase()}`, done: (students.data?.total ?? 0) > 0, to: '/students' },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">
            {greeting()}, {firstName}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {me?.institute.name} · {labels.academicYear} {year?.name ?? '—'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {can('students.manage') && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} component={RouterLink} to="/students?admit=1">
              Admit {labels.student.toLowerCase()}
            </Button>
          )}
          {can('employees.manage') && (
            <Button variant="outlined" startIcon={<AddRoundedIcon />} component={RouterLink} to="/staff?add=1">
              Add staff
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={plural(labels.student)} value={students.data?.total ?? 0} loading={students.isLoading} icon={<GroupsRoundedIcon />} color="#4f46e5" to="/students" hint="Enrolled this year" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Staff" value={staff.data?.total ?? 0} loading={staff.isLoading} icon={<BadgeRoundedIcon />} color="#0ea5e9" to="/staff" hint="Teaching & non-teaching" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={plural(labels.section)} value={sections.data?.length ?? 0} loading={sections.isLoading} icon={<ClassRoundedIcon />} color="#10b981" to="/sections" hint={`Across ${levels.data?.length ?? 0} ${plural(labels.level).toLowerCase()}`} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={plural(labels.subject)} value={subjects.data?.total ?? 0} loading={subjects.isLoading} icon={<MenuBookRoundedIcon />} color="#f59e0b" to="/subjects" hint={`${assignments.data?.length ?? 0} teacher allocations`} />
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Getting started"
              subheader={completed === steps.length ? 'Your institute is fully set up.' : `${completed} of ${steps.length} steps completed`}
            />
            <CardContent>
              <LinearProgress variant="determinate" value={(completed / steps.length) * 100} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
              <List disablePadding>
                {steps.map((step) => (
                  <ListItemButton key={step.label} component={RouterLink} to={step.to} sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 38 }}>
                      {step.done ? <CheckCircleRoundedIcon color="success" /> : <RadioButtonUncheckedRoundedIcon color="disabled" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      primaryTypographyProps={{
                        fontWeight: 550,
                        sx: { textDecoration: step.done ? 'line-through' : 'none', color: step.done ? 'text.secondary' : 'text.primary' },
                      }}
                    />
                    <ArrowForwardRoundedIcon fontSize="small" color="action" />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title={`${plural(labels.section)} this year`} subheader="Capacity and class teacher at a glance" action={<Button component={RouterLink} to="/sections" size="small">View all</Button>} />
            <CardContent>
              {(sections.data ?? []).slice(0, 6).map((section) => {
                const level = levels.data?.find((l) => l.id === section.levelId);
                return (
                  <Stack
                    key={section.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    component={RouterLink}
                    to={`/sections/${section.id}`}
                    sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider', textDecoration: 'none', color: 'inherit', '&:last-child': { borderBottom: 0 } }}
                  >
                    <Typography fontWeight={600}>
                      {level?.name ?? labels.level} – {section.name}
                    </Typography>
                    <Typography variant="body2" color={section.classTeacherId ? 'success.main' : 'warning.main'} fontWeight={600}>
                      {section.classTeacherId ? `${labels.classTeacher} set` : `No ${labels.classTeacher.toLowerCase()}`}
                    </Typography>
                  </Stack>
                );
              })}
              {sections.data?.length === 0 && (
                <Typography color="text.secondary" variant="body2">
                  No {plural(labels.section).toLowerCase()} yet for this year.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
