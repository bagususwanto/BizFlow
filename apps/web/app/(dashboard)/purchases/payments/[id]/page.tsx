'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  StoreIcon,
  ArrowLeft,
  Trash,
  Edit,
  CreditCard,
  Building,
  Clock,
  User,
  Hash,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { useFormatDate } from '@/hooks';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  formatCurrency,
} from '@bizflow/ui';

import { supplierPaymentsService } from '@/services/supplier-payments.service';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useState } from 'react';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';
import {
  useDeleteSupplierPayment,
  useSupplierPayment,
} from '@/hooks/use-supplier-payments';

export default function SupplierPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations('purchases.payments.detail');

  const {
    data: payment,
    isLoading,
    refetch,
    isError,
  } = useSupplierPayment(resolvedParams.id);

  const deleteMutation = useDeleteSupplierPayment();
  const { formatDate, formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/purchases/payments/${resolvedParams.id}`,
    payment?.paymentNumber || t('title'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !payment) {
    return <ErrorState title={t('failedLoad')} onRetry={() => refetch()} />;
  }

  const handleDelete = () => {
    deleteMutation.mutate(payment.id, {
      onSuccess: () => {
        router.push('/purchases/payments');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/purchases/payments')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {payment.paymentNumber}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{formatDate(payment.paymentDate)}</span>
              <span>•</span>
              <Badge variant="outline">{payment.paymentMethod}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/purchases/payments/${payment.id}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> {t('actions.edit')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> {t('actions.delete')}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('supplierInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <div className="font-medium">{payment.supplier?.name}</div>

                  {payment.supplier?.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{payment.supplier.address}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {payment.supplier?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{payment.supplier.phone}</span>
                      </div>
                    )}
                    {payment.supplier?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{payment.supplier.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('paymentInfo.method')}
                </span>
                <span className="font-medium uppercase">
                  {payment.paymentMethod}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('paymentInfo.account')}
                </span>
                <span className="font-medium">{payment.account?.name}</span>
              </div>
              {payment.account?.bankName && (
                <div className="flex items-center gap-2 text-sm pl-6">
                  <span className="text-muted-foreground">
                    {payment.account.bankName}
                    {payment.account.accountNumber
                      ? ` - ${payment.account.accountNumber}`
                      : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('paymentInfo.reference')}
                </span>
                <span className="font-medium">{payment.reference || '-'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Amount & Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('notesInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium">
                  {t('notesInfo.notes')}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {payment.notes || '-'}
                </p>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t('notesInfo.createdAt')}</span>
                <span>{formatDateTime(payment.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{t('notesInfo.createdBy')}</span>
                <span>{payment.creator?.name || payment.createdBy}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('amountInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.purchaseOrder && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('amountInfo.po')}
                  </span>
                  <span className="font-medium">
                    {payment.purchaseOrder.orderNumber}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('amountInfo.totalPaid')}</span>
                <span>{formatCurrency(Number(payment.amount))}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
