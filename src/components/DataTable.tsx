import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  pagination?: Pagination;
}

export function DataTable<T>({ columns, rows, rowKey, loading, onRowClick, empty, pagination }: Props<T>) {
  const responsive = (column: Column<T>) =>
    column.hideBelow ? { display: { xs: 'none', [column.hideBelow]: 'table-cell' } } : undefined;

  const showSkeleton = loading && !rows?.length;

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align} sx={{ width: column.width, ...responsive(column) }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={responsive(column)}>
                      <Skeleton width={i % 2 ? '60%' : '80%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!showSkeleton &&
              rows?.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : undefined, '&:last-child td': { borderBottom: 0 } }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align} sx={responsive(column)}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && rows?.length === 0 && (empty ?? <EmptyState title="Nothing here yet" compact />)}
      {pagination && pagination.total > pagination.limit && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          onPageChange={(_e, page) => pagination.onPageChange(page + 1)}
          rowsPerPageOptions={pagination.onLimitChange ? [10, 25, 50, 100] : [pagination.limit]}
          onRowsPerPageChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      )}
    </Box>
  );
}
