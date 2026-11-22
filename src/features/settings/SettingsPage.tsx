import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { toApiError } from '@/api/errors';
import { useSettings, useUpdateSettings } from '@/api/hooks';
import type { SettingsMap, SettingsSection } from '@/api/types';
import { useAuth } from '@/app/auth';
import { LoadingButton } from '@/components/LoadingButton';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/states';
import { useNotify } from '@/lib/notify';

const SECTIONS: { key: SettingsSection; label: string; description: string }[] = [
  { key: 'labels', label: 'Terminology', description: 'Rename things to match how your institute talks — "Class" or "Semester", "Teacher" or "Faculty".' },
  { key: 'general', label: 'General', description: 'Date format and the working week.' },
  { key: 'structure', label: 'Structure', description: 'Section sizes and how roll numbers are given.' },
  { key: 'attendance', label: 'Attendance', description: 'How attendance is taken and the minimum required.' },
  { key: 'assessment', label: 'Assessment', description: 'Grading scheme and pass mark.' },
  { key: 'idFormats', label: 'Number formats', description: 'Patterns for admission numbers, employee codes and receipts.' },
];

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsSection>('labels');
  const section = SECTIONS.find((s) => s.key === tab)!;
  return (
    <>
      <PageHeader title="Settings" subtitle="Changes apply to everyone in your institute immediately." />
      <Card>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          {SECTIONS.map((s) => (
            <Tab key={s.key} value={s.key} label={s.label} />
          ))}
        </Tabs>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6">{section.label}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {section.description}
          </Typography>
          <SectionEditor key={tab} section={tab} />
        </CardContent>
      </Card>
    </>
  );
}

function SectionEditor<S extends SettingsSection>({ section }: { section: S }) {
  const { can } = useAuth();
  const notify = useNotify();
  const { data, isLoading, error, refetch } = useSettings(section);
  const update = useUpdateSettings(section);
  const [draft, setDraft] = useState<SettingsMap[S] | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState(false);
  const readOnly = !can('settings.manage');

  useEffect(() => {
    if (data) setDraft(data.data);
  }, [data]);

  if (isLoading || !draft) return error ? <ErrorState error={error} onRetry={refetch} /> : <LoadingState height={200} />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(data?.data);
  const set = (patch: Partial<SettingsMap[S]>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = async () => {
    if (!data) return;
    setFieldErrors({});
    setConflict(false);
    try {
      await update.mutateAsync({ data: draft, version: data.version });
      notify.success('Settings saved');
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.code === 'VERSION_CONFLICT') setConflict(true);
      setFieldErrors(apiError.fieldErrors);
      if (!Object.keys(apiError.fieldErrors).length && apiError.code !== 'VERSION_CONFLICT') notify.error(err);
    }
  };

  const editor = renderEditor(section, draft, set, fieldErrors, readOnly);

  return (
    <Stack spacing={3}>
      {conflict && (
        <Alert severity="warning" action={<LoadingButton color="inherit" size="small" onClick={() => refetch()}>Reload</LoadingButton>}>
          Someone else changed these settings while you were editing. Reload to see the latest version.
        </Alert>
      )}
      <Box>{editor}</Box>
      {!readOnly && (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <LoadingButton variant="contained" onClick={save} loading={update.isPending} disabled={!dirty}>
            Save changes
          </LoadingButton>
          {dirty && (
            <LoadingButton color="inherit" onClick={() => setDraft(data!.data)} disabled={update.isPending}>
              Discard
            </LoadingButton>
          )}
        </Stack>
      )}
    </Stack>
  );
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function renderEditor<S extends SettingsSection>(
  section: S,
  draft: SettingsMap[S],
  set: (patch: Partial<SettingsMap[S]>) => void,
  errors: Record<string, string>,
  disabled: boolean,
): ReactNode {
  const field = (key: string, label: string, props: Record<string, unknown> = {}) => {
    const value = (draft as Record<string, unknown>)[key];
    return (
      <TextField
        label={label}
        value={value ?? ''}
        disabled={disabled}
        error={Boolean(errors[key])}
        helperText={errors[key] ?? (props.helperText as string | undefined)}
        onChange={(e) => set({ [key]: props.type === 'number' ? Number(e.target.value) : e.target.value } as Partial<SettingsMap[S]>)}
        {...props}
      />
    );
  };
  const select = (key: string, label: string, options: [string, string][], numeric = false) => (
    <TextField
      select
      label={label}
      value={String((draft as Record<string, unknown>)[key])}
      disabled={disabled}
      onChange={(e) => set({ [key]: numeric ? Number(e.target.value) : e.target.value } as Partial<SettingsMap[S]>)}
    >
      {options.map(([value, text]) => (
        <MenuItem key={value} value={value}>
          {text}
        </MenuItem>
      ))}
    </TextField>
  );

  switch (section) {
    case 'labels': {
      const entries: [keyof SettingsMap['labels'], string, string][] = [
        ['academicYear', 'Academic year', 'Academic Year / Session'],
        ['program', 'Program', 'Program / Course / Stream'],
        ['level', 'Level', 'Class / Grade / Semester'],
        ['section', 'Section', 'Section / Division / Batch'],
        ['subject', 'Subject', 'Subject / Paper / Course'],
        ['term', 'Term', 'Term / Semester'],
        ['student', 'Student', 'Student / Learner'],
        ['teacher', 'Teacher', 'Teacher / Faculty'],
        ['guardian', 'Guardian', 'Parent / Guardian'],
        ['classTeacher', 'Class teacher', 'Class Teacher / Mentor'],
      ];
      return (
        <Grid container spacing={2}>
          {entries.map(([key, label, hint]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              {field(key, label, { helperText: hint })}
            </Grid>
          ))}
        </Grid>
      );
    }
    case 'general': {
      const general = draft as SettingsMap['general'];
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            {select('dateFormat', 'Date format', [
              ['DD/MM/YYYY', 'DD/MM/YYYY (31/12/2026)'],
              ['MM/DD/YYYY', 'MM/DD/YYYY (12/31/2026)'],
              ['YYYY-MM-DD', 'YYYY-MM-DD (2026-12-31)'],
            ])}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {select('weekStartsOn', 'Week starts on', DAYS.map((d, i) => [String(i), d]), true)}
          </Grid>
          <Grid item xs={12}>
            <FormLabel>Working days</FormLabel>
            <FormGroup row>
              {DAYS.map((day, index) => (
                <FormControlLabel
                  key={day}
                  label={day}
                  control={
                    <Checkbox
                      disabled={disabled}
                      checked={general.workingDays.includes(index)}
                      onChange={(e) =>
                        set({
                          workingDays: e.target.checked
                            ? [...general.workingDays, index].sort()
                            : general.workingDays.filter((d) => d !== index),
                        } as unknown as Partial<SettingsMap[S]>)
                      }
                    />
                  }
                />
              ))}
            </FormGroup>
          </Grid>
        </Grid>
      );
    }
    case 'structure': {
      const structure = draft as SettingsMap['structure'];
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            {field('maxStudentsPerSection', 'Default section capacity', { type: 'number' })}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {field('termsPerYear', 'Terms per year', { type: 'number' })}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {select('rollNumberStrategy', 'Roll numbers', [
              ['ADMISSION_ORDER', 'Automatic, in admission order'],
              ['MANUAL', 'Entered manually'],
            ])}
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch disabled={disabled} checked={structure.usesPrograms} onChange={(e) => set({ usesPrograms: e.target.checked } as unknown as Partial<SettingsMap[S]>)} />}
              label="Use programs / courses (colleges and universities)"
            />
          </Grid>
        </Grid>
      );
    }
    case 'attendance':
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            {select('mode', 'Attendance mode', [
              ['DAILY', 'Once a day'],
              ['PERIOD_WISE', 'Every period / lecture'],
            ])}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {field('minimumPercentage', 'Minimum attendance %', { type: 'number' })}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {field('editableForDays', 'Editable for (days)', { type: 'number', helperText: 'How long teachers can correct attendance' })}
          </Grid>
        </Grid>
      );
    case 'assessment':
      return (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            {select('gradingScheme', 'Grading scheme', [
              ['MARKS', 'Marks'],
              ['GRADES', 'Grades'],
              ['CGPA', 'CGPA'],
            ])}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {field('passPercentage', 'Pass percentage', { type: 'number' })}
          </Grid>
        </Grid>
      );
    case 'idFormats':
      return (
        <Stack spacing={2.5}>
          <Alert severity="info">
            Use <b>{'{YYYY}'}</b>, <b>{'{YY}'}</b>, <b>{'{MM}'}</b> and <b>{'{SEQ:4}'}</b> (a running number padded to 4 digits). Year-based patterns restart numbering every year.
          </Alert>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              {field('admissionNo', 'Admission number', { helperText: 'e.g. ADM-{YYYY}-{SEQ:4}' })}
            </Grid>
            <Grid item xs={12} md={4}>
              {field('employeeCode', 'Employee code', { helperText: 'e.g. EMP-{SEQ:4}' })}
            </Grid>
            <Grid item xs={12} md={4}>
              {field('receiptNo', 'Fee receipt number', { helperText: 'e.g. RCPT-{YYYY}-{SEQ:6}' })}
            </Grid>
          </Grid>
        </Stack>
      );
    default:
      return null;
  }
}
