import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { usePermissionCatalog, useRoles } from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/states';

export function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const { data: catalog } = usePermissionCatalog();

  return (
    <>
      <PageHeader title="Roles & access" subtitle="What each role can see and do. Built-in roles are managed by iSkool." />
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
                    <TableCell key={role.id} align="center">
                      {role.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell />
                  {roles.map((role) => (
                    <TableCell key={role.id} align="center">
                      {role.grantsAll ? <Chip size="small" color="primary" label="Full access" /> : <Chip size="small" variant="outlined" label={role.isSystem ? 'Built-in' : 'Custom'} />}
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
    </>
  );
}
