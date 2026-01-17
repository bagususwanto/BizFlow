'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
} from '@bizflow/ui';
import { AuditLog } from '@/services/audit-logs.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Eye } from 'lucide-react';

interface AuditLogsTableProps {
  data: AuditLog[];
  onViewDetail: (log: AuditLog) => void;
  isLoading?: boolean;
  columnVisibility?: Record<string, boolean>;
}

export function AuditLogsTable({
  data,
  onViewDetail,
  columnVisibility = {},
}: AuditLogsTableProps) {
  const isVisible = (columnId: string) => columnVisibility[columnId] !== false;
  if (data.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Tidak ada data audit log</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          Belum ada aktivitas yang tercatat sesuai filter yang Anda pilih.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isVisible('time') && <TableHead>Waktu</TableHead>}
            {isVisible('user') && <TableHead>User</TableHead>}
            {isVisible('module') && <TableHead>Module</TableHead>}
            {isVisible('action') && <TableHead>Aksi</TableHead>}
            {isVisible('entity') && <TableHead>Entity</TableHead>}
            {isVisible('ipAddress') && <TableHead>IP Address</TableHead>}
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((log) => (
            <TableRow key={log.id}>
              {isVisible('time') && (
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                    locale: id,
                  })}
                </TableCell>
              )}
              {isVisible('user') && (
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{log.user?.name || '-'}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.user?.username || '-'}
                    </span>
                  </div>
                </TableCell>
              )}
              {isVisible('module') && (
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {log.module}
                  </Badge>
                </TableCell>
              )}
              {isVisible('action') && (
                <TableCell>
                  <Badge
                    variant={
                      log.action === 'create'
                        ? 'default' // Primary/Black for create (solid)
                        : log.action === 'update'
                          ? 'secondary' // Secondary/Gray for update
                          : log.action === 'delete'
                            ? 'destructive' // Red for delete
                            : 'outline' // Outline for read/others
                    }
                    className="capitalize"
                  >
                    {log.action}
                  </Badge>
                </TableCell>
              )}
              {isVisible('entity') && (
                <TableCell>
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
                </TableCell>
              )}
              {isVisible('ipAddress') && (
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.ipAddress || '-'}
                </TableCell>
              )}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetail(log)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
