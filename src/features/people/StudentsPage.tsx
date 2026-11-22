import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { Box, Button, Card, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudents } from '@/api/hooks';
import { useAcademicYear } from '@/app/academic-year';
import { plural, useAuth } from '@/app/auth';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { PersonCell } from '@/components/PersonCell';
import { SearchField } from '@/components/SearchField';
import { formatDate, fullName, titleCase } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { useAcademicLookups } from '../academic/use-lookups';
import { AdmitStudentDialog } from './AdmitStudentDialog';

export function StudentsPage() {
  const { labels, can } = useAuth();
  const { isClosed, year } = useAcademicYear();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const lookups = useAcademicLookups();
  const [search, setSearch] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const q = useDebounce(search);
  const { data, isLoading } = useStudents({ q: q || undefined, sectionId: sectionId || undefined, page, limit });
  const admitting = params.get('admit') === '1';
  const canAdmit = can('students.manage') && !isClosed;

  const setAdmitting = (open: boolean) => setParams(open ? { admit: '1' } : {}, { replace: true });

  return (
    <>
      <PageHeader
        title={plural(labels.student)}
        subtitle={`${data?.total ?? 0} enrolled in ${year?.name ?? 'this year'}`}
        actions={
          canAdmit && (
            <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => setAdmitting(true)}>
              Admit {labels.student.toLowerCase()}
            </Button>
          )
        }
      />
      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <SearchField
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Name, admission no. or parent phone"
          />
          <TextField
            select
            size="small"
            label={labels.section}
            value={sectionId}
            onChange={(e) => {
              setSectionId(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 220, maxWidth: { sm: 260 } }}
          >
            <MenuItem value="">All {plural(labels.section).toLowerCase()}</MenuItem>
            {lookups.sectionOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <DataTable
          rows={data?.items}
          loading={isLoading}
          rowKey={(e) => e.id}
          onRowClick={(e) => navigate(`/students/${e.studentId.id}`)}
          pagination={
            data && {
              page,
              limit,
              total: data.total,
              onPageChange: setPage,
              onLimitChange: (l) => {
                setLimit(l);
                setPage(1);
              },
            }
          }
          columns={[
            { key: 'name', header: labels.student, render: (e) => <PersonCell name={fullName(e.studentId)} secondary={e.studentId.admissionNo} /> },
            {
              key: 'section',
              header: labels.section,
              render: (e) => (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {lookups.sectionName(e.sectionId)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Roll {e.rollNo}
                  </Typography>
                </Box>
              ),
            },
            { key: 'gender', header: 'Gender', hideBelow: 'md', render: (e) => (e.studentId.gender ? titleCase(e.studentId.gender) : '—') },
            {
              key: 'guardian',
              header: labels.guardian,
              hideBelow: 'sm',
              render: (e) => {
                const g = e.studentId.guardians.find((x) => x.isPrimary) ?? e.studentId.guardians[0];
                return g ? (
                  <Box>
                    <Typography variant="body2">{g.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {g.phone}
                    </Typography>
                  </Box>
                ) : (
                  '—'
                );
              },
            },
            { key: 'since', header: 'Admitted', hideBelow: 'lg', render: (e) => formatDate(e.studentId.admissionDate) },
          ]}
          empty={
            <EmptyState
              icon={<GroupsRoundedIcon />}
              title={q || sectionId ? 'No matching students' : `No ${plural(labels.student).toLowerCase()} enrolled yet`}
              description={q || sectionId ? 'Try clearing the filters.' : `Admit your first ${labels.student.toLowerCase()} into a ${labels.section.toLowerCase()}.`}
              action={!q && !sectionId && canAdmit && <Button variant="contained" onClick={() => setAdmitting(true)}>Admit {labels.student.toLowerCase()}</Button>}
            />
          }
        />
      </Card>
      {admitting && <AdmitStudentDialog defaultSectionId={sectionId} onClose={() => setAdmitting(false)} />}
    </>
  );
}
