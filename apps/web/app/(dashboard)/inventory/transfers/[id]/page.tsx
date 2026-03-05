'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Trash,
  CheckCircle,
  XCircle,
  StoreIcon,
  Clock,
  User,
  AlertCircle,
  Send,
  FileText,
} from 'lucide-react';
import { useFormatDate } from '@/hooks';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  Textarea,
  Label,
} from '@bizflow/ui';

import { stockTransfersService } from '@/services/stock-transfers.service';
import {
  useDeleteStockTransfer,
  useUpdateStockTransferStatus,
} from '@/hooks/use-stock-transfers';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

export default function StockTransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const t = useTranslations('transfers.detail');

  const {
    data: transfer,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['stock-transfers', resolvedParams.id],
    queryFn: () => stockTransfersService.getById(resolvedParams.id),
  });

  const updateStatusMutation = useUpdateStockTransferStatus();
  const deleteMutation = useDeleteStockTransfer();
  const { formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/inventory/transfers/${resolvedParams.id}`,
    transfer?.transferNumber || t('title'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !transfer) {
    return <ErrorState title={t('messages.error')} onRetry={() => refetch()} />;
  }

  const handleDelete = async () => {
    deleteMutation.mutate(transfer.id, {
      onSuccess: () => {
        router.push('/inventory/transfers');
      },
    });
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;

    updateStatusMutation.mutate(
      {
        id: transfer.id,
        data: {
          status: nextStatus as any,
          notes: statusNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNextStatus(null);
          setStatusNotes('');
          refetch();
        },
      },
    );
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'outline';
      case 'sent':
        return 'warning';
      case 'received':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalReqQty =
    transfer.items?.reduce(
      (acc, item) => acc + Number(item.requestedQty || 0),
      0,
    ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/inventory/transfers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {transfer.transferNumber}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDateTime(transfer.createdAt)}</span>
              </div>
              <Badge variant={statusBadgeVariant(transfer.status) as any}>
                {transfer.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {transfer.status === 'draft' && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> {t('buttons.delete')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('sent');
                  setStatusDialogOpen(true);
                }}
              >
                <Send className="mr-2 h-4 w-4" /> {t('buttons.send')}
              </Button>
            </>
          )}

          {transfer.status === 'sent' && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('cancelled');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> {t('buttons.cancel')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('received');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {t('buttons.receive')}
              </Button>
            </>
          )}

          {transfer.status === 'cancelled' && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              title="Delete from history"
            >
              <Trash className="mr-2 h-4 w-4" /> {t('buttons.delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('infoTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-full border p-1 border-primary/20 bg-primary/10">
                    <ArrowLeft className="h-4 w-4 text-primary rotate-45" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t('fromWarehouse')}
                    </div>
                    <div className="font-medium">
                      {transfer.fromWarehouse?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-full border p-1 border-primary/20 bg-primary/10">
                    <ArrowLeft className="h-4 w-4 text-primary -rotate-135" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t('toWarehouse')}
                    </div>
                    <div className="font-medium">
                      {transfer.toWarehouse?.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {t('notes')}
                </div>
                <div className="font-medium mt-1">{transfer.notes || '-'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Dates & Users */}
          <Card>
            <CardHeader>
              <CardTitle>{t('datesTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('createdBy')}</span>
                <span className="font-medium text-right flex-1">
                  {transfer.creator?.name || '-'}
                </span>
              </div>
              <Separator />
              {(transfer.status === 'sent' ||
                transfer.status === 'received' ||
                transfer.status === 'cancelled') && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Send className="h-4 w-4 text-warning" />
                    <span className="text-muted-foreground">{t('sentBy')}</span>
                    <span className="font-medium text-right flex-1">
                      {transfer.sender?.name || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('sentAt')}</span>
                    <span className="font-medium text-right flex-1">
                      {formatDateTime(transfer.sentAt || '')}
                    </span>
                  </div>
                </>
              )}

              {(transfer.status === 'received' ||
                transfer.status === 'cancelled') && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    {transfer.status === 'received' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-muted-foreground">
                      {transfer.status === 'received'
                        ? t('receivedBy')
                        : 'Cancelled By'}
                    </span>
                    <span className="font-medium text-right flex-1">
                      {transfer.receiver?.name || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {transfer.status === 'received'
                        ? t('receivedAt')
                        : 'Cancelled At'}
                    </span>
                    <span className="font-medium text-right flex-1">
                      {formatDateTime(transfer.receivedAt || '')}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warning if Cancelled */}
        {transfer.status === 'cancelled' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Transfer Cancelled</AlertTitle>
            <AlertDescription>
              This stock transfer was cancelled. Any stock deducted from the
              origin warehouse has been reverted.
            </AlertDescription>
          </Alert>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('itemsTitle')}</CardTitle>
            <Badge variant="outline">{transfer.items?.length || 0} items</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Requested Qty</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.items?.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.variant?.product?.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.variant?.sku}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {Number(item.requestedQty || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {item.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-sm rounded-lg border bg-card p-4">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">
                    {t('totalItems')}
                  </span>
                  <span className="font-medium">
                    {transfer.items?.length || 0}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">
                    {t('totalReqQty')}
                  </span>
                  <span className="font-medium text-primary">
                    {totalReqQty}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {nextStatus === 'sent' && t('dialogs.send.title')}
              {nextStatus === 'received' && t('dialogs.receive.title')}
              {nextStatus === 'cancelled' && t('dialogs.cancel.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nextStatus === 'sent' && t('dialogs.send.desc')}
              {nextStatus === 'received' && t('dialogs.receive.desc')}
              {nextStatus === 'cancelled' && t('dialogs.cancel.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Optional/Required Notes for Receive/Cancel */}
          {(nextStatus === 'received' || nextStatus === 'cancelled') && (
            <div className="my-4 space-y-2">
              <Label>
                {nextStatus === 'cancelled'
                  ? t('dialogs.cancel.notes')
                  : t('dialogs.receive.notes')}
              </Label>
              <Textarea
                placeholder="Add notes..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateStatus}
              disabled={
                updateStatusMutation.isPending ||
                (nextStatus === 'cancelled' && !statusNotes.trim())
              }
              className={
                nextStatus === 'cancelled'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : undefined
              }
            >
              {nextStatus === 'sent' && t('dialogs.send.confirm')}
              {nextStatus === 'received' && t('dialogs.receive.confirm')}
              {nextStatus === 'cancelled' && t('dialogs.cancel.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title={t('buttons.delete') + '?'}
        description="Are you sure you want to delete this transfer? This action cannot be undone."
      />
    </div>
  );
}
