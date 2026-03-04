'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  StoreIcon,
  ArrowLeft,
  Trash,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Printer,
  Phone,
  Mail,
  MapPin,
  User,
} from 'lucide-react';
import { useFormatDate } from '@/hooks';
import { toast } from 'sonner';

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
  formatCurrency,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
} from '@bizflow/ui';

import { purchaseReturnsService } from '@/services/purchase-returns.service';
import {
  useDeletePurchaseReturn,
  useUpdatePurchaseReturnStatus,
} from '@/hooks/use-purchase-returns';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

export default function PurchaseReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const t = useTranslations('purchases.returns.detail');

  const {
    data: ret,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['purchase-returns', resolvedParams.id],
    queryFn: () => purchaseReturnsService.getById(resolvedParams.id),
  });

  const updateStatusMutation = useUpdatePurchaseReturnStatus();
  const deleteMutation = useDeletePurchaseReturn();
  const { formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/purchases/returns/${resolvedParams.id}`,
    ret?.returnNumber || t('title'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !ret) {
    return <ErrorState title={t('failedLoad')} onRetry={() => refetch()} />;
  }

  const handleDelete = async () => {
    deleteMutation.mutate(ret.id, {
      onSuccess: () => {
        router.push('/purchases/returns');
      },
    });
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;

    updateStatusMutation.mutate(
      {
        id: ret.id,
        data: { status: nextStatus as any },
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNextStatus(null);
          refetch();
        },
      },
    );
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/purchases/returns')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {ret.returnNumber}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDateTime(ret.createdAt)}</span>
              </div>
              <Badge variant={statusBadgeVariant(ret.status) as any}>
                {ret.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Print button */}
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/purchases/returns/${ret.id}/print`, '_blank')
            }
          >
            <Printer className="mr-2 h-4 w-4" /> {t('actions.print')}
          </Button>

          {ret.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> {t('actions.delete')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('approved');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {t('actions.approve')}
              </Button>
            </>
          )}

          {ret.status === 'approved' && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('rejected');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> {t('actions.reject')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('completed');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {t('actions.complete')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Section: PO & Supplier Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('sourceInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('sourceInfo.order')}
                  </div>
                  <div className="font-medium">{ret.order?.orderNumber}</div>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground"
                    onClick={() =>
                      router.push(`/purchases/orders/${ret.orderId}`)
                    }
                  >
                    {t('sourceInfo.viewPo')}
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-4 pt-2">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {t('sourceInfo.supplier')}
                  </div>
                  <div className="font-medium">{ret.order?.supplier?.name}</div>
                  {ret.order?.supplier?.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{ret.order.supplier.address}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {ret.order?.supplier?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{ret.order.supplier.phone}</span>
                      </div>
                    )}
                    {ret.order?.supplier?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{ret.order.supplier.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('statusInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('statusInfo.createdAt')}
                </span>
                <span className="font-medium text-right flex-1">
                  {formatDateTime(ret.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('statusInfo.createdBy')}
                </span>
                <span className="font-medium text-right flex-1">
                  {ret.creator?.name || ret.createdBy}
                </span>
              </div>
              <Separator />
              {ret.status !== 'pending' && ret.approver && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {ret.status === 'rejected'
                      ? t('statusInfo.rejectedBy')
                      : t('statusInfo.approvedBy')}
                  </span>
                  <span className="font-medium text-right flex-1">
                    {ret.approver.name}
                  </span>
                </div>
              )}
              {ret.approvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {ret.status === 'rejected'
                      ? t('statusInfo.rejectedAt')
                      : t('statusInfo.approvedAt')}
                  </span>
                  <span className="font-medium text-right flex-1">
                    {formatDateTime(ret.approvedAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warning if Rejected */}
        {ret.status === 'rejected' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>{t('rejectedWarning.title')}</AlertTitle>
            <AlertDescription>{t('rejectedWarning.desc')}</AlertDescription>
          </Alert>
        )}

        {/* Middle Section: Items */}
        <Card>
          <CardHeader>
            <CardTitle>{t('items.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('items.product')}</TableHead>
                  <TableHead>{t('items.reason')}</TableHead>
                  <TableHead className="text-right">{t('items.qty')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ret.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.variant?.product?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.variant?.sku}
                      </div>
                    </TableCell>
                    <TableCell>{item.reason || '-'}</TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bottom Section: Reason & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('notes.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium">
                {t('notes.reason')}
              </div>
              <p className="text-sm text-muted-foreground">
                {ret.reason || '-'}
              </p>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">
                {t('notes.additional')}
              </div>
              <p className="text-sm text-muted-foreground">
                {ret.notes || '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('statusDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('statusDialog.desc1')}
              <span className="font-bold uppercase">{nextStatus}</span>
              {t('statusDialog.desc2')}
              {nextStatus === 'completed' && (
                <div className="mt-2 text-destructive">
                  {t('statusDialog.warning')}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('statusDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>
              {t('statusDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title={t('deleteDialog.title')}
        description={t('deleteDialog.desc')}
      />
    </div>
  );
}
