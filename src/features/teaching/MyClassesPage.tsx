import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { toApiError } from '@/api/errors';
import { useLevels, useMyTeaching } from '@/api/hooks';
import { useAuth } from '@/app/auth';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/states';
import { StatusChip } from '@/components/StatusChip';
import { colorFor, formatDate } from '@/lib/format';

export function MyClassesPage() {
  return (
    <>
      <PageHeader title="My classes" subtitle="Subjects you teach and the class you look after." />
      <MyClassesView />
    </>
  );
}

export function MyClassesView() {
  const { labels } = useAuth();
  const { data, isLoading, error, refetch } = useMyTeaching();
  const { data: levels } = useLevels();
  const levelName = (id?: string) => levels?.find((l) => l.id === id)?.name ?? labels.level;

  if (isLoading) return <LoadingState />;
  if (error) {
    if (toApiError(error).status === 404) {
      return <EmptyState title="No staff profile linked" description="Ask your administrator to link your login to a staff record." />;
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }
  if (!data) return null;

  return (
    <Stack spacing={3}>
      {data.classTeacherOf && (
        <Card
          sx={{
            color: '#fff',
            border: 0,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.9 }}>
              <StarRoundedIcon fontSize="small" />
              <Typography variant="overline">You are the {labels.classTeacher.toLowerCase()} of</Typography>
            </Stack>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              {levelName(data.classTeacherOf.levelId)} – {data.classTeacherOf.name}
            </Typography>
            <Typography
              component={RouterLink}
              to={`/sections/${data.classTeacherOf.id}`}
              sx={{ color: '#fff', opacity: 0.9, mt: 1, display: 'inline-block', fontWeight: 600 }}
            >
              Open {labels.section.toLowerCase()} →
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {labels.subject}s you teach · {data.academicYear.name}
        </Typography>
        {data.subjects.length === 0 ? (
          <Card>
            <EmptyState icon={<MenuBookRoundedIcon />} title="No subjects assigned yet" description="Once your administrator allocates subjects to you, they will appear here." />
          </Card>
        ) : (
          <Grid container spacing={2}>
            {data.subjects.map(({ assignmentId, role, since, offering }) => {
              const subject = offering?.subjectId;
              const color = colorFor(subject?.code ?? assignmentId);
              return (
                <Grid item xs={12} sm={6} lg={4} key={assignmentId}>
                  <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box
                          sx={{ width: 44, height: 44, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: alpha(color, 0.12), color }}
                        >
                          <MenuBookRoundedIcon />
                        </Box>
                        <StatusChip value={role} />
                      </Stack>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        {subject?.name ?? 'Subject'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject?.code}
                        {offering?.batch ? ` · Batch ${offering.batch}` : ''}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                        {offering?.sectionIds.map((section) => (
                          <Chip
                            key={section.id}
                            icon={<ClassRoundedIcon />}
                            size="small"
                            label={`${levelName(section.levelId)} – ${section.name}`}
                            component={RouterLink}
                            to={`/sections/${section.id}`}
                            clickable
                          />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Teaching since {formatDate(since)}
                        {offering?.weeklyPeriods ? ` · ${offering.weeklyPeriods} periods/week` : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Stack>
  );
}
