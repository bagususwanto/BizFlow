'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@bizflow/ui';
import { Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AuditLog } from '@/services/audit-logs.service';

interface AuditLogsColumnsProps {
  onViewDetail: (log: AuditLog) => void;
}

export const getColumns = ({
  onViewDetail,
}: AuditLogsColumnsProps): ColumnDef<AuditLog>[] => [
  {
    accessorKey: 'createdAt',
    id: 'time',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          <span>Waktu</span>
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm:ss', {
          locale: id,
        })}
      </span>
    ),
  },
  {
    accessorKey: 'user.name',
    id: 'user',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          <span>User</span>
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.user?.name || '-'}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.user?.username || '-'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'module',
    id: 'module',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          <span>Module</span>
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.module}
      </Badge>
    ),
  },
  {
    accessorKey: 'action',
    id: 'action',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 h-8"
        >
          <span>Aksi</span>
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const log = row.original;
      return (
        <Badge
          variant={
            log.action === 'create'
              ? 'default'
              : log.action === 'update'
                ? 'secondary'
                : log.action === 'delete'
                  ? 'destructive'
                  : 'outline'
          }
          className="capitalize"
        >
          {log.action}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'entityType',
    id: 'entity',
    header: 'Entity',
    cell: ({ row }) => {
      const log = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium capitalize">
            {log.entityType || '-'}
          </span>
          {log.entityId && (
            <span
              className="font-mono text-xs text-muted-foreground truncate w-32"
              title={log.entityId}
            >
              {log.entityId}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'ipAddress',
    id: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.ipAddress || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewDetail(row.original)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
