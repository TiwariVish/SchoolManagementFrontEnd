import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import type { ReactNode } from 'react';
import { plural, type AuthContextValue } from '@/app/auth';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export function buildNav({ can, labels, isTeacher, me }: AuthContextValue): NavGroup[] {
  const isEmployee = me?.profile?.type === 'EMPLOYEE';
  const groups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', to: '/', icon: <DashboardRoundedIcon /> },
        ...(isTeacher || isEmployee ? [{ label: 'My classes', to: '/my-classes', icon: <SchoolRoundedIcon /> }] : []),
      ],
    },
    {
      title: 'Academics',
      items: [
        ...(can('academic.read')
          ? [
              { label: plural(labels.academicYear), to: '/academic-years', icon: <CalendarMonthRoundedIcon /> },
              { label: `${plural(labels.program)} & ${plural(labels.level)}`, to: '/programs', icon: <AccountTreeRoundedIcon /> },
              { label: plural(labels.subject), to: '/subjects', icon: <MenuBookRoundedIcon /> },
              { label: plural(labels.section), to: '/sections', icon: <ClassRoundedIcon /> },
            ]
          : []),
        ...(can('teaching.read')
          ? [{ label: `${labels.teacher} allocation`, to: '/allocation', icon: <AssignmentIndRoundedIcon /> }]
          : []),
      ],
    },
    {
      title: 'People',
      items: [
        ...(can('students.read') ? [{ label: plural(labels.student), to: '/students', icon: <GroupsRoundedIcon /> }] : []),
        ...(can('employees.read') ? [{ label: 'Staff', to: '/staff', icon: <BadgeRoundedIcon /> }] : []),
      ],
    },
    {
      title: 'Administration',
      items: [
        ...(can('institute.read') ? [{ label: 'Institute', to: '/institute', icon: <ApartmentRoundedIcon /> }] : []),
        ...(can('settings.read') ? [{ label: 'Settings', to: '/settings', icon: <TuneRoundedIcon /> }] : []),
        ...(can('roles.read') ? [{ label: 'Roles & access', to: '/roles', icon: <AdminPanelSettingsRoundedIcon /> }] : []),
      ],
    },
  ];
  return groups.filter((group) => group.items.length > 0);
}
