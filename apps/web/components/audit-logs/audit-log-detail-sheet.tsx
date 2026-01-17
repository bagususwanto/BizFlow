'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  ScrollArea,
  Badge,
} from '@bizflow/ui';
import { AuditLog } from '@/services/audit-logs.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AuditLogDetailSheetProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailSheet({
  log,
  open,
  onOpenChange,
}: AuditLogDetailSheetProps) {
  if (!log) return null;

  const formatDate = (date: string) =>
    format(new Date(date), 'dd MMMM yyyy HH:mm:ss', { locale: id });

  let oldValueParsed = null;
  let newValueParsed = null;

  try {
    if (log.oldValue) oldValueParsed = JSON.parse(log.oldValue);
    if (log.newValue) newValueParsed = JSON.parse(log.newValue);
  } catch (e) {
    // If not JSON, keep as string
    if (log.oldValue) oldValueParsed = log.oldValue;
    if (log.newValue) newValueParsed = log.newValue;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Detail Audit Log</SheetTitle>
          <SheetDescription>
            Detail aktivitas pengguna yang tercatat dalam sistem.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-6 py-6">
            {/* Informasi Umum */}
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-semibold text-sm">Informasi Umum</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Waktu</span>
                  <p className="font-medium">{formatDate(log.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">User</span>
                  <p className="font-medium">{log.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{log.user?.username}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Module</span>
                  <p>
                    <Badge variant="outline" className="capitalize">
                      {log.module}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Aksi</span>
                  <p>
                    <Badge variant="outline" className="capitalize">
                      {log.action}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* Entity Info */}
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-semibold text-sm">Informasi Entity</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Entity Type</span>
                  <p className="font-medium capitalize">
                    {log.entityType || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Entity ID</span>
                  <p className="font-mono text-xs break-all">
                    {log.entityId || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address</span>
                  <p className="font-mono text-xs">{log.ipAddress || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">User Agent</span>
                  <p className="text-xs break-all text-muted-foreground">
                    {log.userAgent || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Changes Diff */}
            {(log.oldValue || log.newValue) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Perubahan Data</h4>

                {oldValueParsed && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-destructive">
                      Nilai Lama (Old Value)
                    </span>
                    <pre className="rounded-md bg-destructive/10 p-4 text-xs overflow-auto max-h-60 border border-destructive/20 text-destructive-foreground">
                      {typeof oldValueParsed === 'object'
                        ? JSON.stringify(oldValueParsed, null, 2)
                        : oldValueParsed}
                    </pre>
                  </div>
                )}

                {newValueParsed && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Nilai Baru (New Value)
                    </span>
                    <pre className="rounded-md bg-green-500/10 p-4 text-xs overflow-auto max-h-60 border border-green-500/20 text-green-900 dark:text-green-100">
                      {typeof newValueParsed === 'object'
                        ? JSON.stringify(newValueParsed, null, 2)
                        : newValueParsed}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
