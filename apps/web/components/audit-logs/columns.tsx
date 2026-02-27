'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button } from '@bizflow/ui';
import { Eye } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormatDate, DateFormatters } from '@/hooks';
import { AuditLog } from '@/services/audit-logs.service';

import { useTranslations } from 'next-intl';

interface AuditLogsColumnsProps {
  onViewDetail: (log: AuditLog) => void;
  t: ReturnType<typeof useTranslations>;
  formatters: DateFormatters;
}

export const getColumns = ({
  onViewDetail,
  t,
  formatters,
}: AuditLogsColumnsProps): ColumnDef<AuditLog>[] => {
  const { formatDateTimeFull } = formatters;

  return [
    {
      accessorKey: 'createdAt',
      id: 'time',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.time')} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {formatDateTimeFull(row.original.createdAt)}
        </span>
      ),
      meta: {
        title: t('columns.time'),
      },
    },
    {
      accessorKey: 'user.name',
      id: 'user',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.user')} />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.user?.name || '-'}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.user?.username || '-'}
          </span>
        </div>
      ),
      meta: {
        title: t('columns.user'),
      },
    },
    {
      accessorKey: 'module',
      id: 'module',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.module')} />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.module}
        </Badge>
      ),
      meta: {
        title: t('columns.module'),
      },
    },
    {
      accessorKey: 'action',
      id: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.action')} />
      ),
      cell: ({ row }) => {
        const log = row.original;
        const actionMap: Record<string, string> = {
          create: t('actions.create'),
          update: t('actions.update'),
          delete: t('actions.delete'),
          login: t('actions.login'),
          logout: t('actions.logout'),
        };

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
            {actionMap[log.action] || log.action}
          </Badge>
        );
      },
      meta: {
        title: t('columns.action'),
      },
    },
    {
      accessorKey: 'entityType',
      id: 'entity',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.entityType')}
        />
      ),
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
      meta: {
        title: t('columns.entityType'),
      },
    },
    {
      accessorKey: 'ipAddress',
      id: 'ipAddress',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.ipAddress')} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.ipAddress || '-'}
        </span>
      ),
      meta: {
        title: t('columns.ipAddress'),
      },
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
};
