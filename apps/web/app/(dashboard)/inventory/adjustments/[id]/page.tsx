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

import { stockAdjustmentsService } from '@/services/stock-adjustments.service';
import {
  useDeleteStockAdjustment,
  useUpdateStockAdjustmentStatus,
} from '@/hooks/use-stock-adjustments';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

export default function StockAdjustmentDetailPage({
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
  const t = useTranslations('adjustments.detail');

  const {
    data: adjustment,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['stock-adjustments', resolvedParams.id],
    queryFn: () => stockAdjustmentsService.getById(resolvedParams.id),
  });

  const updateStatusMutation = useUpdateStockAdjustmentStatus();
  const deleteMutation = useDeleteStockAdjustment();
  const { formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/inventory/adjustments/${resolvedParams.id}`,
    adjustment?.adjustmentNumber || t('title'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !adjustment) {
    return <ErrorState title={t('messages.error')} onRetry={() => refetch()} />;
  }

  const handleDelete = async () => {
    deleteMutation.mutate(adjustment.id, {
      onSuccess: () => {
        router.push('/inventory/adjustments');
      },
    });
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;

    updateStatusMutation.mutate(
      {
        id: adjustment.id,
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
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case 'increase':
        return 'secondary';
      case 'decrease':
        return 'warning';
      case 'correction':
        return 'default';
      default:
        return 'outline';
    }
  };

  const totalSystemQty =
    adjustment.items?.reduce(
      (acc, item) => acc + Number(item.systemQty || 0),
      0,
    ) || 0;
  const totalAdjQty =
    adjustment.items?.reduce(
      (acc, item) => acc + Number(item.adjustmentQty || 0),
      0,
    ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/inventory/adjustments')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {adjustment.adjustmentNumber}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDateTime(adjustment.createdAt)}</span>
              </div>
              <Badge variant={statusBadgeVariant(adjustment.status) as any}>
                {adjustment.status.toUpperCase()}
              </Badge>
              <Badge variant={typeBadgeVariant(adjustment.type) as any}>
                {adjustment.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {adjustment.status === 'draft' && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> {t('buttons.delete')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('pending');
                  setStatusDialogOpen(true);
                }}
              >
                <Send className="mr-2 h-4 w-4" /> {t('buttons.submit')}
              </Button>
            </>
          )}

          {adjustment.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('rejected');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> {t('buttons.reject')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('approved');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {t('buttons.approve')}
              </Button>
            </>
          )}

          {adjustment.status === 'rejected' && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
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
              <div className="flex items-start gap-4">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('warehouse')}
                  </div>
                  <div className="font-medium">
                    {adjustment.warehouse?.name}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('reason')}
                  </div>
                  <div className="font-medium capitalize">
                    {adjustment.reason}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('notes')}
                  </div>
                  <div className="font-medium">{adjustment.notes || '-'}</div>
                </div>
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
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('date')}</span>
                <span className="font-medium text-right flex-1">
                  {formatDateTime(adjustment.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('createdBy')}</span>
                <span className="font-medium text-right flex-1">
                  {adjustment.creator?.name || '-'}
                </span>
              </div>
              <Separator />
              {(adjustment.status === 'approved' ||
                adjustment.status === 'rejected') && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    {adjustment.status === 'approved' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-muted-foreground">
                      {adjustment.status === 'approved'
                        ? t('approvedBy')
                        : 'Rejected By'}
                    </span>
                    <span className="font-medium text-right flex-1">
                      {adjustment.approver?.name || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {adjustment.status === 'approved'
                        ? t('approvedAt')
                        : 'Rejected At'}
                    </span>
                    <span className="font-medium text-right flex-1">
                      {formatDateTime(adjustment.approvedAt || '')}
                    </span>
                  </div>
                  {adjustment.statusNotes && (
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm border">
                      <div className="font-semibold mb-1">Status Notes:</div>
                      {adjustment.statusNotes}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warning if Rejected */}
        {adjustment.status === 'rejected' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Adjustment Rejected</AlertTitle>
            <AlertDescription>
              This stock adjustment request was rejected and will not affect
              stock levels.
            </AlertDescription>
          </Alert>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('itemsTitle')}</CardTitle>
            <Badge variant="outline">
              {adjustment.items?.length || 0} items
            </Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">System Qty</TableHead>
                  <TableHead className="text-right">Adj Qty</TableHead>
                  <TableHead className="text-right">Final Qty</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustment.items?.map((item) => {
                  const sysQty = Number(item.systemQty || 0);
                  const adjQty = Number(item.adjustmentQty || 0);
                  const finalQty = sysQty + adjQty;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.variant?.product?.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.variant?.sku}
                      </TableCell>
                      <TableCell className="text-right">{sysQty}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          adjQty > 0
                            ? 'text-success'
                            : adjQty < 0
                              ? 'text-destructive'
                              : ''
                        }`}
                      >
                        {adjQty > 0 ? `+${adjQty}` : adjQty}
                      </TableCell>
                      <TableCell className="text-right">{finalQty}</TableCell>
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
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium">
                    {adjustment.items?.length || 0}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">
                    Total System Qty
                  </span>
                  <span className="font-medium">{totalSystemQty}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">Total Adj Qty</span>
                  <span
                    className={`font-medium ${
                      totalAdjQty > 0
                        ? 'text-success'
                        : totalAdjQty < 0
                          ? 'text-destructive'
                          : ''
                    }`}
                  >
                    {totalAdjQty > 0 ? `+${totalAdjQty}` : totalAdjQty}
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
              {nextStatus === 'pending' && t('dialogs.submit.title')}
              {nextStatus === 'approved' && t('dialogs.approve.title')}
              {nextStatus === 'rejected' && t('dialogs.reject.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nextStatus === 'pending' && t('dialogs.submit.desc')}
              {nextStatus === 'approved' && t('dialogs.approve.desc')}
              {nextStatus === 'rejected' && t('dialogs.reject.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Optional/Required Notes for Approve/Reject */}
          {(nextStatus === 'approved' || nextStatus === 'rejected') && (
            <div className="my-4 space-y-2">
              <Label>
                {nextStatus === 'rejected'
                  ? t('dialogs.reject.notes')
                  : t('dialogs.approve.notes')}
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
                (nextStatus === 'rejected' && !statusNotes.trim())
              }
              className={
                nextStatus === 'rejected'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : undefined
              }
            >
              {nextStatus === 'pending' && t('dialogs.submit.confirm')}
              {nextStatus === 'approved' && t('dialogs.approve.confirm')}
              {nextStatus === 'rejected' && t('dialogs.reject.confirm')}
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
        description="Are you sure you want to delete this adjustment? This action cannot be undone."
      />
    </div>
  );
}
