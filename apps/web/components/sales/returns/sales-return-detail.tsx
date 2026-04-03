'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  RefreshCcw,
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
  formatCurrency,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
} from '@bizflow/ui';

import {
  useDeleteSalesReturn,
  useUpdateSalesReturnStatus,
} from '@/hooks/use-sales-returns';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

interface SalesReturnDetailProps {
  ret: any;
  refetch: () => void;
}

export function SalesReturnDetail({ ret, refetch }: SalesReturnDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const t = useTranslations('sales.returns.detail');

  const updateStatusMutation = useUpdateSalesReturnStatus();
  const deleteMutation = useDeleteSalesReturn();
  const { formatDateTime } = useFormatDate();

  const handleDelete = async () => {
    deleteMutation.mutate(ret.id, {
      onSuccess: () => {
        router.push('/sales/returns');
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
            onClick={() => router.push('/sales/returns')}
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
              {ret.returnToStock && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs text-blue-600 border-blue-200 bg-blue-50">
                  <RefreshCcw className="h-3 w-3" />
                  Return to Stock
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {ret.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> Hapus
              </Button>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  setNextStatus('rejected');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> Tolak
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('approved');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Setujui
              </Button>
            </>
          )}

          {ret.status === 'approved' && (
            <Button
              onClick={() => {
                setNextStatus('completed');
                setStatusDialogOpen(true);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Selesai
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('infoTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Sales Order Reference</div>
                  <div className="font-medium">{ret.order?.orderNumber}</div>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground"
                    onClick={() =>
                      router.push(`/sales/orders/${ret.orderId}`)
                    }
                  >
                    Lihat Order
                  </Button>
                </div>
              </div>

              {ret.invoiceId && (
                <div className="flex items-start gap-4 pt-2">
                  <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Invoice Reference</div>
                    <div className="font-medium">{ret.invoice?.invoiceNumber}</div>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm text-muted-foreground"
                      onClick={() =>
                        router.push(`/sales/invoices/${ret.invoiceId}`)
                      }
                    >
                      Lihat Invoice
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 pt-2">
                <User className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Pelanggan
                  </div>
                  <div className="font-medium">{ret.order?.customer?.name || 'Pelanggan Umum'}</div>
                  {ret.order?.customer?.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{ret.order.customer.email}</span>
                    </div>
                  )}
                  {ret.order?.customer?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{ret.order.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dibuat Pada</span>
                <span className="font-medium text-right flex-1">
                  {formatDateTime(ret.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dibuat Oleh</span>
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
                      ? 'Ditolak Oleh'
                      : t('approvedBy')}
                  </span>
                  <span className="font-medium text-right flex-1">
                    {ret.approver?.name}
                  </span>
                </div>
              )}
              {ret.approvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Waktu Persetujuan</span>
                  <span className="font-medium text-right flex-1">
                    {formatDateTime(ret.approvedAt)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Metode Pengembalian Dana</span>
                <span className="font-medium text-right flex-1 uppercase">
                  {ret.refundMethod}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-semibold">{t('totalRefund')}</span>
                <span className="font-bold text-right flex-1">
                  {formatCurrency(ret.refundAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {ret.status === 'rejected' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Retur Ditolak</AlertTitle>
            <AlertDescription>Permintaan retur pelanggan ini telah ditolak dan dibatalkan.</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('items.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Estimasi Pengembalian Dana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ret.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.orderItem?.variant?.product?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.orderItem?.variant?.sku}
                      </div>
                    </TableCell>
                    <TableCell>{item.reason || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.quantity) * Number(item.orderItem?.price || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium">Alasan Utama Retur</div>
              <p className="text-sm text-muted-foreground">
                {ret.reason || '-'}
              </p>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">Catatan Tambahan</div>
              <p className="text-sm text-muted-foreground">
                {ret.notes || '-'}
              </p>
            </div>
            {ret.status === 'rejected' && ret.rejectionReason && (
              <div>
                <div className="mb-1 text-sm font-medium text-destructive">Alasan Penolakan</div>
                <p className="text-sm text-muted-foreground">
                  {ret.rejectionReason}
                </p>
              </div>
            )}
            {ret.status === 'approved' && ret.approvalNotes && (
              <div>
                <div className="mb-1 text-sm font-medium">Catatan Persetujuan</div>
                <p className="text-sm text-muted-foreground">
                  {ret.approvalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin {nextStatus === 'approved' ? 'menyetujui' : nextStatus === 'rejected' ? 'menolak' : 'menyelesaikan'} retur penjualan ini?
              {nextStatus === 'approved' && ret.returnToStock && (
                <div className="mt-2 text-amber-600 font-medium">
                  Stok akan ditambahkan kembali ke inventaris secara otomatis karena flag ReturnToStock aktif.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>
              Format {nextStatus === 'approved' ? 'Setujui' : 'Konfirmasi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title="Hapus Retur Penjualan"
        description="Apakah Anda yakin ingin menghapus catatan retur ini? Ini tidak dapat diurungkan."
      />
    </div>
  );
}
