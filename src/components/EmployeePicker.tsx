import { Autocomplete, TextField } from '@mui/material';
import { useState } from 'react';
import { useEmployees } from '@/api/hooks';
import type { Employee } from '@/api/types';
import { fullName } from '@/lib/format';
import { useDebounce } from '@/lib/use-debounce';
import { PersonCell } from './PersonCell';

interface Props {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
  label?: string;
  error?: string;
  teachingOnly?: boolean;
}

/** Server-side searchable staff picker, so it scales past the first page of employees. */
export function EmployeePicker({ value, onChange, label = 'Teacher', error, teachingOnly = true }: Props) {
  const [input, setInput] = useState('');
  const q = useDebounce(input);
  const { data, isFetching } = useEmployees({
    q: q || undefined,
    limit: 20,
    status: 'ACTIVE',
    category: teachingOnly ? 'TEACHING' : undefined,
  });

  return (
    <Autocomplete
      value={value}
      onChange={(_e, next) => onChange(next)}
      inputValue={input}
      onInputChange={(_e, next) => setInput(next)}
      options={data?.items ?? []}
      loading={isFetching}
      filterOptions={(options) => options}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={(option) => `${fullName(option)} (${option.employeeCode})`}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <PersonCell name={fullName(option)} secondary={[option.employeeCode, option.designation].filter(Boolean).join(' · ')} size={32} />
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} error={Boolean(error)} helperText={error} />}
      noOptionsText={q ? 'No matching staff' : 'No active teaching staff yet'}
    />
  );
}
