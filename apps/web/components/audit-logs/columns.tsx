'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@bizflow/ui';
import { Eye } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Waktu" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Module" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.module}
      </Badge>
    ),
  },
  {
    accessorKey: 'action',
    id: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aksi" />
    ),
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
