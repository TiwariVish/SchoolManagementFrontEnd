import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { applyFieldErrors } from '@/api/errors';
import { useAdmitStudent } from '@/api/hooks';
import { useAuth } from '@/app/auth';
import { FormSelect, FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { useNotify } from '@/lib/notify';
import { useAcademicLookups } from '../academic/use-lookups';

const PHONE = /^\+?[0-9]{7,15}$/;
const optionalEmail = z.union([z.literal(''), z.string().trim().email('Invalid email')]).optional();

const schema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(60),
  lastName: z.string().trim().max(60).optional(),
  gender: z.enum(['', 'MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  admissionDate: z.string().optional(),
  sectionId: z.string().min(1, 'Required'),
  rollNo: z.number().int().min(1).max(9999).optional(),
  phone: z.union([z.literal(''), z.string().regex(PHONE, '7–15 digits')]).optional(),
  email: optionalEmail,
  guardians: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Required'),
        relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']),
        phone: z.string().regex(PHONE, '7–15 digits'),
        email: optionalEmail,
      }),
    )
    .min(1, 'Add at least one contact')
    .max(4),
});
type Values = z.infer<typeof schema>;

const RELATIONS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GUARDIAN', label: 'Guardian' },
  { value: 'OTHER', label: 'Other' },
];

export function AdmitStudentDialog({ defaultSectionId = '', onClose }: { defaultSectionId?: string; onClose: () => void }) {
  const { labels } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const admit = useAdmitStudent();
  const { sectionOptions } = useAcademicLookups();
  const { control, handleSubmit, setError } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      admissionDate: dayjs().format('YYYY-MM-DD'),
      sectionId: defaultSectionId,
      phone: '',
      email: '',
      guardians: [{ name: '', relation: 'FATHER', phone: '', email: '' }],
    },
  });
  const guardians = useFieldArray({ control, name: 'guardians' });

  const submit = handleSubmit(async (values) => {
    const body = {
      ...values,
      lastName: values.lastName || undefined,
      gender: values.gender || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      admissionDate: values.admissionDate || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      guardians: values.guardians.map((g, i) => ({ ...g, email: g.email || undefined, isPrimary: i === 0 })),
    };
    try {
      const { student, enrollment } = await admit.mutateAsync(body);
      notify.success(`${student.firstName} admitted · ${student.admissionNo} · Roll ${enrollment.rollNo}`);
      onClose();
      navigate(`/students/${student.id}`);
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(err);
    }
  });

  return (
    <FormDialog
      open
      title={`Admit ${labels.student.toLowerCase()}`}
      description="Admission number and roll number are generated automatically."
      onClose={onClose}
      onSubmit={submit}
      submitting={admit.isPending}
      submitLabel="Admit"
      maxWidth="md"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="firstName" label="First name" autoFocus />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="lastName" label="Last name" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormSelect
            control={control}
            name="gender"
            label="Gender"
            emptyLabel="Not specified"
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormText control={control} name="dateOfBirth" label="Date of birth" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormText control={control} name="admissionDate" label="Admission date" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <FormSelect control={control} name="sectionId" label={labels.section} options={sectionOptions} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormText control={control} name="rollNo" label="Roll no." type="number" helperText="Blank = next number" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="phone" label={`${labels.student} phone (optional)`} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormText control={control} name="email" label={`${labels.student} email (optional)`} type="email" />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1">{labels.guardian} contacts</Typography>
          <Typography variant="caption" color="text.secondary">
            The first contact is the primary one.
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          disabled={guardians.fields.length >= 4}
          onClick={() => guardians.append({ name: '', relation: 'MOTHER', phone: '', email: '' })}
        >
          Add contact
        </Button>
      </Stack>
      <Stack spacing={2}>
        {guardians.fields.map((field, index) => (
          <Grid container spacing={2} key={field.id} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <FormText control={control} name={`guardians.${index}.name`} label="Name" />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormSelect control={control} name={`guardians.${index}.relation`} label="Relation" options={RELATIONS} />
            </Grid>
            <Grid item xs={6} sm={2.5}>
              <FormText control={control} name={`guardians.${index}.phone`} label="Phone" />
            </Grid>
            <Grid item xs={10} sm={3}>
              <FormText control={control} name={`guardians.${index}.email`} label="Email" />
            </Grid>
            <Grid item xs={2} sm={0.5} sx={{ pt: '24px !important' }}>
              {index > 0 && (
                <IconButton size="small" onClick={() => guardians.remove(index)} aria-label="Remove contact">
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}
      </Stack>
    </FormDialog>
  );
}
