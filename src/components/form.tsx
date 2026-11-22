import { FormControlLabel, MenuItem, Switch, TextField, type TextFieldProps } from '@mui/material';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

export function FormText<T extends FieldValues>({ control, name, ...props }: BaseProps<T> & TextFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          value={field.value ?? ''}
          onChange={(e) =>
            field.onChange(props.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)
          }
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? props.helperText}
        />
      )}
    />
  );
}

export interface Option {
  value: string;
  label: string;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  options,
  emptyLabel,
  ...props
}: BaseProps<T> & TextFieldProps & { options: Option[]; emptyLabel?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          select
          value={field.value ?? ''}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? props.helperText}
        >
          {emptyLabel !== undefined && (
            <MenuItem value="">
              <em>{emptyLabel}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}

export function FormSwitch<T extends FieldValues>({ control, name, label }: BaseProps<T> & { label: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControlLabel control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />} label={label} />
      )}
    />
  );
}
