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
import { useFormatDate } from '@/hooks';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('auditLogs');
  const { formatDateTimeFull } = useFormatDate();

  if (!log) return null;

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

  const actionMap: Record<string, string> = {
    create: t('actions.create'),
    update: t('actions.update'),
    delete: t('actions.delete'),
    login: t('actions.login'),
    logout: t('actions.logout'),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('detail.title')}</SheetTitle>
          <SheetDescription>{t('detail.description')}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-6 py-6">
            {/* Informasi Umum */}
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-semibold text-sm">
                {t('detail.generalInfo')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.time')}
                  </span>
                  <p className="font-medium">
                    {formatDateTimeFull(log.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.user')}
                  </span>
                  <p className="font-medium">{log.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{log.user?.username}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.module')}
                  </span>
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {log.module}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.action')}
                  </span>
                  <div>
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
                      {actionMap[log.action] || log.action}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Entity Info */}
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-semibold text-sm">
                {t('detail.entityInfo')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.entityType')}
                  </span>
                  <p className="font-medium capitalize">
                    {log.entityType || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.entityId')}
                  </span>
                  <p className="font-mono text-xs break-all">
                    {log.entityId || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.ipAddress')}
                  </span>
                  <p className="font-mono text-xs">{log.ipAddress || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('detail.userAgent')}
                  </span>
                  <p className="text-xs break-all text-muted-foreground">
                    {log.userAgent || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Changes Diff */}
            {(log.oldValue || log.newValue) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">{t('detail.changes')}</h4>

                {oldValueParsed && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-destructive">
                      {t('detail.oldValue')}
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
                    <span className="text-xs font-medium text-success">
                      {t('detail.newValue')}
                    </span>
                    <pre className="rounded-md bg-success/10 p-4 text-xs overflow-auto max-h-60 border border-success/20 text-success">
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
