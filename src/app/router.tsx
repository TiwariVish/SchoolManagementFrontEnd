import { Box, Button, Typography } from '@mui/material';
import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, Link as RouterLink } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { GuestOnly, RequireAuth, RequirePermission } from './guards';
import { RootProviders } from './RootProviders';

const page = <K extends string>(loader: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(async () => ({ default: (await loader())[name] }));

const DashboardPage = page(() => import('@/features/dashboard/DashboardPage'), 'DashboardPage');
const MyClassesPage = page(() => import('@/features/teaching/MyClassesPage'), 'MyClassesPage');
const AcademicYearsPage = page(() => import('@/features/academic/AcademicYearsPage'), 'AcademicYearsPage');
const ProgramsPage = page(() => import('@/features/academic/ProgramsPage'), 'ProgramsPage');
const SubjectsPage = page(() => import('@/features/academic/SubjectsPage'), 'SubjectsPage');
const SectionsPage = page(() => import('@/features/academic/SectionsPage'), 'SectionsPage');
const SectionDetailPage = page(() => import('@/features/academic/SectionDetailPage'), 'SectionDetailPage');
const AllocationPage = page(() => import('@/features/teaching/AllocationPage'), 'AllocationPage');
const StudentsPage = page(() => import('@/features/people/StudentsPage'), 'StudentsPage');
const StudentDetailPage = page(() => import('@/features/people/StudentDetailPage'), 'StudentDetailPage');
const StaffPage = page(() => import('@/features/people/StaffPage'), 'StaffPage');
const InstitutePage = page(() => import('@/features/institute/InstitutePage'), 'InstitutePage');
const SettingsPage = page(() => import('@/features/settings/SettingsPage'), 'SettingsPage');
const RolesPage = page(() => import('@/features/roles/RolesPage'), 'RolesPage');
const FeesPage = page(() => import('@/features/finance/FeesPage'), 'FeesPage');
const SalariesPage = page(() => import('@/features/finance/SalariesPage'), 'SalariesPage');
const StaffAttendancePage = page(() => import('@/features/attendance/StaffAttendancePage'), 'StaffAttendancePage');
const ChangePasswordPage = page(() => import('@/features/auth/ChangePasswordPage'), 'ChangePasswordPage');

const guarded = (permission: string, Component: ComponentType) => (
  <RequirePermission permission={permission}>
    <Component />
  </RequirePermission>
);

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h2" color="primary">
        404
      </Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>
        Page not found
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 3 }}>
        Back to dashboard
      </Button>
    </Box>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'my-classes', element: <MyClassesPage /> },
              { path: 'academic-years', element: guarded('academic.read', AcademicYearsPage) },
              { path: 'programs', element: guarded('academic.read', ProgramsPage) },
              { path: 'subjects', element: guarded('academic.read', SubjectsPage) },
              { path: 'sections', element: guarded('academic.read', SectionsPage) },
              { path: 'sections/:id', element: guarded('academic.read', SectionDetailPage) },
              { path: 'allocation', element: guarded('teaching.read', AllocationPage) },
              { path: 'students', element: guarded('students.read', StudentsPage) },
              { path: 'students/:id', element: guarded('students.read', StudentDetailPage) },
              { path: 'staff', element: guarded('employees.read', StaffPage) },
              { path: 'institute', element: guarded('institute.read', InstitutePage) },
              { path: 'settings', element: guarded('settings.read', SettingsPage) },
              { path: 'roles', element: guarded('roles.read', RolesPage) },
              { path: 'fees', element: guarded('fees.read', FeesPage) },
              { path: 'salaries', element: guarded('payroll.read', SalariesPage) },
              { path: 'attendance', element: guarded('attendance.read', StaffAttendancePage) },
              { path: 'account/password', element: <ChangePasswordPage /> },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
]);
