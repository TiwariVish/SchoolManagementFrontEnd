import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { Avatar, Stack, Typography, alpha } from '@mui/material';
import type { InstituteStatus, InstituteType, PlatformInstitute } from '@/api/types';
import { StatusChip } from '@/components/StatusChip';
import { daysUntil } from '@/lib/format';

export const TYPE_META: Record<InstituteType, { label: string; plural: string; color: string; icon: JSX.Element }> = {
  SCHOOL: { label: 'School', plural: 'Schools', color: '#4f46e5', icon: <SchoolRoundedIcon /> },
  COLLEGE: { label: 'College', plural: 'Colleges', color: '#0ea5e9', icon: <ApartmentRoundedIcon /> },
  UNIVERSITY: { label: 'University', plural: 'Universities', color: '#8b5cf6', icon: <AccountBalanceRoundedIcon /> },
};

export const STATUS_LABELS: Record<InstituteStatus, string> = {
  TRIAL: 'Trial',
  ACTIVE: 'Active (paid)',
  READ_ONLY: 'Read-only',
  SUSPENDED: 'Suspended',
};

export function InstituteAvatar({ type, size = 40 }: { type: InstituteType; size?: number }) {
  const meta = TYPE_META[type];
  return (
    <Avatar
      variant="rounded"
      sx={{ width: size, height: size, borderRadius: 2.5, bgcolor: alpha(meta.color, 0.12), color: meta.color, '& svg': { fontSize: size * 0.55 } }}
    >
      {meta.icon}
    </Avatar>
  );
}

/** Status chip plus the trial countdown, which is what the owner actually needs to act on. */
export function SubscriptionStatus({ institute }: { institute: Pick<PlatformInstitute, 'status' | 'trialEndsAt' | 'trialExpired'> }) {
  const days = institute.status === 'TRIAL' ? daysUntil(institute.trialEndsAt ?? undefined) : null;
  return (
    <Stack spacing={0.5} alignItems="flex-start">
      <StatusChip value={institute.status} label={STATUS_LABELS[institute.status]} />
      {days !== null && (
        <Typography
          variant="caption"
          fontWeight={600}
          color={institute.trialExpired ? 'error.main' : days <= 7 ? 'warning.main' : 'text.secondary'}
        >
          {institute.trialExpired ? `Trial expired ${Math.abs(days)}d ago` : `${days} day${days === 1 ? '' : 's'} left`}
        </Typography>
      )}
    </Stack>
  );
}
