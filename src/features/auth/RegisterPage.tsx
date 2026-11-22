import { zodResolver } from '@hookform/resolvers/zod';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Grid,
  Link,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  alpha,
} from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { applyFieldErrors, errorMessage } from '@/api/errors';
import { useAuth } from '@/app/auth';
import { FormText } from '@/components/form';
import { LoadingButton } from '@/components/LoadingButton';
import { AuthLayout } from './AuthLayout';
import { PASSWORD_HINT, PASSWORD_RULE, PasswordField } from './PasswordField';

const schema = z
  .object({
    institute: z.object({
      type: z.enum(['SCHOOL', 'COLLEGE', 'UNIVERSITY']),
      name: z.string().trim().min(2, 'Enter the institute name'),
      code: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9]{3,12}$/, '3–12 letters or digits, no spaces'),
      phone: z.string().trim().max(20).optional(),
    }),
    academicYear: z.object({
      name: z.string().trim().min(2, 'e.g. 2026-27'),
      startDate: z.string().min(1, 'Required'),
      endDate: z.string().min(1, 'Required'),
    }),
    admin: z.object({
      name: z.string().trim().min(2, 'Enter your name'),
      email: z.string().trim().email('Enter a valid email'),
      password: z.string().regex(PASSWORD_RULE, PASSWORD_HINT),
    }),
  })
  .refine((v) => dayjs(v.academicYear.endDate).isAfter(dayjs(v.academicYear.startDate)), {
    path: ['academicYear', 'endDate'],
    message: 'End date must be after start date',
  });
type Values = z.infer<typeof schema>;

const STEPS = ['Institute', 'Academic year', 'Your account'];
const STEP_FIELDS: (keyof Values)[] = ['institute', 'academicYear', 'admin'];

const TYPES = [
  { value: 'SCHOOL', label: 'School', hint: 'Nursery to Class 12', icon: <SchoolRoundedIcon /> },
  { value: 'COLLEGE', label: 'College', hint: 'Courses & semesters', icon: <ApartmentRoundedIcon /> },
  { value: 'UNIVERSITY', label: 'University', hint: 'Departments & programs', icon: <AccountBalanceRoundedIcon /> },
] as const;

function defaultYear() {
  const now = dayjs();
  const start = now.month() >= 3 ? now.year() : now.year() - 1;
  return { name: `${start}-${String(start + 1).slice(-2)}`, startDate: `${start}-04-01`, endDate: `${start + 1}-03-31` };
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, trigger, setError: setFieldError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      institute: { type: 'SCHOOL', name: '', code: '', phone: '' },
      academicYear: defaultYear(),
      admin: { name: '', email: '', password: '' },
    },
  });

  const next = async () => {
    if (await trigger(STEP_FIELDS[step])) setStep((s) => s + 1);
  };

  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await register({ ...values, institute: { ...values.institute, phone: values.institute.phone || undefined } });
      navigate('/', { replace: true });
    } catch (err) {
      if (!applyFieldErrors(err, setFieldError)) setError(errorMessage(err));
      const fields = Object.keys((err as { fieldErrors?: object }).fieldErrors ?? {});
      const firstStep = STEP_FIELDS.findIndex((f) => fields.some((field) => field.startsWith(f)));
      if (firstStep >= 0) setStep(firstStep);
    }
  });

  return (
    <AuthLayout>
      <Typography variant="h4">Set up your institute</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Free 30-day trial. No card required.
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4, '& .MuiStepLabel-label': { fontSize: '0.8rem' } }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) void next();
          else void submit(e);
        }}
      >
        <Stack spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}

          {step === 0 && (
            <>
              <Controller
                control={control}
                name="institute.type"
                render={({ field }) => (
                  <Grid container spacing={1.5}>
                    {TYPES.map((type) => {
                      const selected = field.value === type.value;
                      return (
                        <Grid item xs={4} key={type.value}>
                          <Card
                            sx={(theme) => ({
                              borderColor: selected ? 'primary.main' : 'divider',
                              borderWidth: selected ? 2 : 1,
                              bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : undefined,
                              height: '100%',
                            })}
                          >
                            <CardActionArea onClick={() => field.onChange(type.value)} sx={{ p: 1.5, height: '100%' }}>
                              <Box sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>{type.icon}</Box>
                              <Typography variant="subtitle2">{type.label}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, display: 'block' }}>
                                {type.hint}
                              </Typography>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              />
              <FormText control={control} name="institute.name" label="Institute name" autoFocus />
              <FormText
                control={control}
                name="institute.code"
                label="Institute code"
                helperText="Short unique code, e.g. GVS2026. Staff use it if they belong to several institutes."
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <FormText control={control} name="institute.phone" label="Phone (optional)" />
            </>
          )}

          {step === 1 && (
            <>
              <Typography variant="body2" color="text.secondary">
                Your first academic year. You can add more years later.
              </Typography>
              <FormText control={control} name="academicYear.name" label="Name" placeholder="2026-27" />
              <Stack direction="row" spacing={2}>
                <FormText control={control} name="academicYear.startDate" label="Starts on" type="date" InputLabelProps={{ shrink: true }} />
                <FormText control={control} name="academicYear.endDate" label="Ends on" type="date" InputLabelProps={{ shrink: true }} />
              </Stack>
            </>
          )}

          {step === 2 && (
            <>
              <FormText control={control} name="admin.name" label="Your full name" autoFocus />
              <FormText control={control} name="admin.email" label="Work email" type="email" autoComplete="email" />
              <PasswordField control={control} name="admin.password" label="Password" helperText={PASSWORD_HINT} autoComplete="new-password" />
            </>
          )}

          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            {step > 0 && (
              <Button size="large" color="inherit" onClick={() => setStep((s) => s - 1)} disabled={formState.isSubmitting}>
                Back
              </Button>
            )}
            <LoadingButton type="submit" size="large" variant="contained" fullWidth loading={formState.isSubmitting}>
              {step < STEPS.length - 1 ? 'Continue' : 'Create institute'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        Already using iSkool?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
