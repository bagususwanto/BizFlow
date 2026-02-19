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
  Package,
  Edit,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatCurrency,
} from '@bizflow/ui';

import { PurchaseOrderStatus, PaymentStatus } from '@bizflow/types';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

export default function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: order,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['purchase-orders', resolvedParams.id],
    queryFn: () => purchaseOrdersService.getById(resolvedParams.id),
  });

  useBreadcrumb(
    `/purchases/orders/${resolvedParams.id}`,
    order?.orderNumber || 'Detail',
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <ErrorState
        title="Gagal memuat detail purchase order"
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await purchaseOrdersService.delete(order.id);
      toast.success('Purchase Order berhasil dihapus');
      router.push('/purchases/orders');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus Purchase Order');
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;

    try {
      await purchaseOrdersService.updateStatus(order.id, {
        status: nextStatus as any,
      });
      toast.success(`Status berhasil diperbarui ke ${nextStatus}`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui status');
    } finally {
      setStatusDialogOpen(false);
      setNextStatus(null);
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return 'secondary';
      case PurchaseOrderStatus.CONFIRMED:
      case 'ordered':
        return 'default';
      case PurchaseOrderStatus.PARTIAL:
      case 'received':
        return 'warning';
      case PurchaseOrderStatus.COMPLETED:
        return 'success';
      case PurchaseOrderStatus.CANCELLED:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const paymentBadgeVariant = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'success';
      case PaymentStatus.PARTIAL:
        return 'warning';
      case PaymentStatus.UNPAID:
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
            onClick={() => router.push('/purchases/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                {format(new Date(order.createdAt), 'dd MMMM yyyy', {
                  locale: id,
                })}
              </span>
              <span>•</span>
              <Badge variant={statusBadgeVariant(order.status) as any}>
                {order.status.toUpperCase()}
              </Badge>
              <span>•</span>
              <Badge variant={paymentBadgeVariant(order.paymentStatus) as any}>
                {order.paymentStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Print button - always available */}
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/purchases/orders/${order.id}/print`, '_blank')
            }
          >
            <Printer className="mr-2 h-4 w-4" /> Print PO
          </Button>
          {order.status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/purchases/orders/${order.id}/edit`)
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
              <Button
                onClick={() => {
                  setNextStatus('ordered');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Pesan ke Pemasok
              </Button>
            </>
          )}

          {order.status === 'ordered' && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('cancelled');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> Batalkan
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/purchases/goods-receive/new?purchaseOrderId=${order.id}`,
                  )
                }
              >
                <Package className="mr-2 h-4 w-4" /> Terima Barang
              </Button>
            </>
          )}

          {order.status === 'received' && (
            <>
              <Button
                onClick={() => {
                  setNextStatus('completed');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Selesai
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Section: Supplier & Order Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pemasok</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{order.supplier?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.supplier?.code}
                  </div>
                </div>
              </div>
              {order.supplier?.phone && (
                <div className="text-sm text-muted-foreground">
                  Telp: {order.supplier?.phone}
                </div>
              )}
              {order.supplier?.email && (
                <div className="text-sm text-muted-foreground">
                  Email: {order.supplier?.email}
                </div>
              )}
              {order.supplier?.address && (
                <div className="text-sm text-muted-foreground">
                  Alamat: {order.supplier?.address}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Lainnya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tgl. Ekspektasi:</span>
                <span className="font-medium">
                  {order.expectedDate
                    ? format(new Date(order.expectedDate), 'dd MMM yyyy', {
                        locale: id,
                      })
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Items */}
        <Card>
          <CardHeader>
            <CardTitle>Item Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.variant.product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.variant.product.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unitPrice))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.subtotal))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bottom Section: Notes & Totals */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.notes || '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rincian Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Diskon ({Number(order.discountPercent)}%)</span>
                <span>- {formatCurrency(Number(order.discountAmount))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Pajak ({Number(order.taxPercent)}%)</span>
                <span>+ {formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sudah Dibayar</span>
                <span>{formatCurrency(Number(order.paidAmount))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-medium text-destructive">
                <span>Sisa Pembayaran</span>
                <span>
                  {formatCurrency(
                    Number(order.total) - Number(order.paidAmount),
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status menjadi{' '}
              <span className="font-bold uppercase">{nextStatus}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>
              Ya, Ubah Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Hapus Purchase Order?"
        description="Apakah Anda yakin ingin menghapus Purchase Order ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
