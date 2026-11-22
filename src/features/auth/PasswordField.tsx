import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import { FormText } from '@/components/form';

export function PasswordField<T extends FieldValues>(props: Parameters<typeof FormText<T>>[0] & TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <FormText<T>
      {...props}
      type={visible ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setVisible((v) => !v)} edge="end" aria-label={visible ? 'Hide password' : 'Show password'}>
              {visible ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;
export const PASSWORD_HINT = 'At least 8 characters with a letter and a number';
