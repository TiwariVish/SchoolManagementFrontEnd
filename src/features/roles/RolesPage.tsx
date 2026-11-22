import { zodResolver } from '@hookform/resolvers/zod';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { applyFieldErrors, toApiError } from '@/api/errors';
import { useCreateRole, useDeleteRole, usePermissionCatalog, useRoles, useUpdateRole } from '@/api/hooks';
import type { Role } from '@/api/types';
import { useAuth } from '@/app/auth';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormText } from '@/components/form';
import { FormDialog } from '@/components/FormDialog';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/states';
import { useNotify } from '@/lib/notify';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a role name').max(80),
  key: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => value === '' || /^[A-Z][A-Z0-9_]{0,39}$/.test(value), {
      message: 'Use A-Z, 0-9 and underscore, starting with a letter',
    }),
  permissions: z.array(z.string()).min(1, 'Pick at least one permission'),
});
type Values = z.infer<typeof schema>;

export function RolesPage() {
  const { can } = useAuth();
  const notify = useNotify();
  const { data: roles, isLoading } = useRoles();
  const { data: catalog } = usePermissionCatalog();
  const canManage = can('roles.manage');
  const [editing, setEditing] = useState<Role | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const remove = useDeleteRole();

  return (
    <>
      <PageHeader
        title="Roles & access"
        subtitle="Built-in roles come with iSkool. Create custom roles for your institute’s own access needs."
        actions={
          canManage && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing('new')}>
              New role
            </Button>
          )
        }
      />
      {isLoading || !roles || !catalog ? (
        <LoadingState />
      ) : (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 260 }}>Permission</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id} align="center" sx={{ minWidth: 120 }}>
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          {role.name}
                        </Typography>
                        {canManage && !role.isSystem && (
                          <Stack direction="row" spacing={0.25}>
                            <Tooltip title="Edit role">
                              <IconButton size="small" onClick={() => setEditing(role)}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete role">
                              <IconButton size="small" color="error" onClick={() => setDeleting(role)}>
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell />
                  {roles.map((role) => (
                    <TableCell key={role.id} align="center">
                      {role.grantsAll ? (
                        <Chip size="small" color="primary" label="Full access" />
                      ) : (
                        <Chip size="small" variant="outlined" label={role.isSystem ? 'Built-in' : 'Custom'} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {catalog.map((permission) => (
                  <TableRow key={permission.key} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {permission.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {permission.key}
                      </Typography>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} align="center">
                        {role.grantsAll || role.permissions.includes(permission.key) ? (
                          <CheckRoundedIcon color="success" fontSize="small" />
                        ) : (
                          <RemoveRoundedIcon color="disabled" fontSize="small" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {editing && catalog && (
        <RoleDialog
          role={editing === 'new' ? null : editing}
          catalog={catalog}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this role?"
        message={
          deleting
            ? `“${deleting.name}” will be removed. Staff already using it must be reassigned first.`
            : ''
        }
        confirmLabel="Delete"
        loading={remove.isPending}
        destructive
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          void remove
            .mutateAsync(deleting.id)
            .then(() => {
              notify.success('Role deleted');
              setDeleting(null);
            })
            .catch((err) => notify.error(err));
        }}
      />
    </>
  );
}

function RoleDialog({
  role,
  catalog,
  onClose,
}: {
  role: Role | null;
  catalog: { key: string; description: string }[];
  onClose: () => void;
}) {
  const notify = useNotify();
  const create = useCreateRole();
  const update = useUpdateRole();
  const isNew = !role;
  const grouped = useMemo(() => groupPermissions(catalog), [catalog]);

  const { control, handleSubmit, setError, reset, watch, setValue } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: role?.name ?? '',
      key: role?.key ?? '',
      permissions: role?.permissions ?? [],
    },
  });

  useEffect(() => {
    reset({
      name: role?.name ?? '',
      key: role?.key ?? '',
      permissions: role?.permissions ?? [],
    });
  }, [role, reset]);

  const selected = watch('permissions');

  const submit = handleSubmit(async (values) => {
    try {
      if (isNew) {
        await create.mutateAsync({
          name: values.name,
          key: values.key || undefined,
          permissions: values.permissions,
        });
        notify.success('Role created');
      } else {
        await update.mutateAsync({ id: role.id, name: values.name, permissions: values.permissions });
        notify.success('Role updated');
      }
      onClose();
    } catch (err) {
      if (!applyFieldErrors(err, setError)) notify.error(toApiError(err).message);
    }
  });

  return (
    <FormDialog
      open
      title={isNew ? 'New custom role' : `Edit ${role.name}`}
      description={
        isNew
          ? 'Pick a name and the permissions this role should have. Key is optional — we generate one from the name.'
          : 'Built-in roles stay fixed. You can change the name and permissions for this custom role.'
      }
      submitLabel={isNew ? 'Create role' : 'Save changes'}
      submitting={create.isPending || update.isPending}
      onClose={onClose}
      onSubmit={submit}
      maxWidth="md"
    >
      <Stack spacing={2.5}>
        <FormText control={control} name="name" label="Role name" autoFocus placeholder="e.g. Librarian" />
        {isNew && (
          <FormText
            control={control}
            name="key"
            label="Key (optional)"
            placeholder="LIBRARIAN"
            helperText="Uppercase code stored on staff logins. Leave blank to auto-generate."
          />
        )}

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Permissions
            </Typography>
            <Button size="small" onClick={() => setValue('permissions', catalog.map((p) => p.key), { shouldValidate: true })}>
              Select all
            </Button>
          </Stack>
          <Controller
            control={control}
            name="permissions"
            render={({ field, fieldState }) => (
              <Stack spacing={2}>
                {grouped.map((group) => (
                  <Card key={group.prefix} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <SecurityRoundedIcon fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {group.label}
                      </Typography>
                    </Stack>
                    <FormGroup>
                      {group.items.map((item) => (
                        <FormControlLabel
                          key={item.key}
                          control={
                            <Checkbox
                              size="small"
                              checked={field.value.includes(item.key)}
                              onChange={(_, checked) => {
                                const next = checked
                                  ? [...field.value, item.key]
                                  : field.value.filter((key) => key !== item.key);
                                field.onChange(next);
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{item.description}</Typography>
                              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                {item.key}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Card>
                ))}
                {fieldState.error && (
                  <Typography color="error" variant="caption">
                    {fieldState.error.message}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {selected.length} selected
                </Typography>
              </Stack>
            )}
          />
        </Box>
      </Stack>
    </FormDialog>
  );
}

function groupPermissions(catalog: { key: string; description: string }[]) {
  const labels: Record<string, string> = {
    institute: 'Institute',
    settings: 'Settings',
    roles: 'Roles',
    academic: 'Academics',
    employees: 'Staff',
    students: 'Students',
    teaching: 'Teaching',
  };
  const map = new Map<string, { prefix: string; label: string; items: typeof catalog }>();
  for (const item of catalog) {
    const prefix = item.key.split('.')[0] ?? 'other';
    const group = map.get(prefix) ?? { prefix, label: labels[prefix] ?? prefix, items: [] };
    group.items.push(item);
    map.set(prefix, group);
  }
  return [...map.values()];
}
