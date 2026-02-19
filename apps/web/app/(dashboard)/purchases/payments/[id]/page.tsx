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
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
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

export default function SupplierPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: payment,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['supplier-payments', resolvedParams.id],
    queryFn: () => supplierPaymentsService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/purchases/payments/${resolvedParams.id}`,
    payment?.paymentNumber || 'Detail Pembayaran',
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <ErrorState
        title="Gagal memuat detail pembayaran"
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await supplierPaymentsService.delete(payment.id);
      toast.success('Pembayaran berhasil dihapus');
      router.push('/purchases/payments');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus pembayaran');
      setIsDeleting(false);
    }
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
              <span>
                {format(new Date(payment.paymentDate), 'dd MMMM yyyy', {
                  locale: idLocale,
                })}
              </span>
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
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Hapus
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pemasok</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{payment.supplier?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.supplier?.code}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Metode:</span>
                <span className="font-medium uppercase">
                  {payment.paymentMethod}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Akun:</span>
                <span className="font-medium">{payment.account?.name}</span>
              </div>
              {payment.reference && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground ml-6">Referensi:</span>
                  <span className="font-medium">{payment.reference}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Amount & Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {payment.notes || '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rincian Jumlah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.purchaseOrder && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purchase Order</span>
                  <span className="font-medium">
                    {payment.purchaseOrder.orderNumber}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Bayar</span>
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
        isDeleting={isDeleting}
        title="Hapus Pembayaran?"
        description="Apakah Anda yakin ingin menghapus pembayaran ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
