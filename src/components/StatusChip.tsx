import { Chip, type ChipProps } from '@mui/material';
import { titleCase } from '@/lib/format';

const COLORS: Record<string, ChipProps['color']> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  PLANNED: 'default',
  CLOSED: 'default',
  READ_ONLY: 'warning',
  SUSPENDED: 'error',
  ON_LEAVE: 'warning',
  EXITED: 'default',
  WITHDRAWN: 'default',
  ALUMNI: 'secondary',
  PRIMARY: 'primary',
  CO_TEACHER: 'info',
  LAB: 'secondary',
  TEACHING: 'primary',
  NON_TEACHING: 'default',
};

export function StatusChip({ value, label, ...props }: { value: string; label?: string } & Omit<ChipProps, 'label'>) {
  return <Chip size="small" variant="outlined" color={COLORS[value] ?? 'default'} label={label ?? titleCase(value)} {...props} />;
}
