import { LoadingButton } from './LoadingButton';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { FormEventHandler, ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  description?: ReactNode;
  submitLabel?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export function FormDialog({
  open,
  title,
  description,
  submitLabel = 'Save',
  submitting,
  onClose,
  onSubmit,
  children,
  maxWidth = 'sm',
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      PaperProps={{ component: 'form', onSubmit, noValidate: true }}
    >
      <DialogTitle>
        {title}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
            {description}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={submitting}>
          {submitLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
