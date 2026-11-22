import { Button, CircularProgress, type ButtonProps } from '@mui/material';

export function LoadingButton({ loading, children, disabled, startIcon, ...props }: ButtonProps & { loading?: boolean }) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {children}
    </Button>
  );
}
