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
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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

  useBreadcrumb(
    `/purchases/returns/${resolvedParams.id}`,
    ret?.returnNumber || 'Detail',
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !ret) {
    return (
      <ErrorState
        title="Gagal memuat detail purchase return"
        onRetry={() => refetch()}
      />
    );
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                {format(new Date(ret.createdAt), 'dd MMMM yyyy', {
                  locale: id,
                })}
              </span>
              <span>•</span>
              <Badge variant={statusBadgeVariant(ret.status) as any}>
                {ret.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Print button - placeholder */}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>

          {ret.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> Hapus
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
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('rejected');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> Tolak
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('completed');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Selesaikan & Kurangi
                Stok
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
              <CardTitle>Informasi Asal Return</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    Order: {ret.order?.orderNumber}
                  </div>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-muted-foreground"
                    onClick={() =>
                      router.push(`/purchases/orders/${ret.orderId}`)
                    }
                  >
                    Lihat Purchase Order &rarr;
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-4 pt-2">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{ret.order?.supplier?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {ret.order?.supplier?.code}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status & Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dibuat pada:</span>
                <span className="font-medium">
                  {format(new Date(ret.createdAt), 'dd MMM yyyy HH:mm', {
                    locale: id,
                  })}
                </span>
              </div>
              {ret.approvedBy && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Disetujui oleh:</span>
                  <span className="font-medium">
                    {/* We might need to fetch user name, but ID is available */}
                    User ID: {ret.approvedBy}
                  </span>
                </div>
              )}
              {ret.approvedAt && (
                <div className="flex items-center gap-2 text-sm pl-6">
                  <span className="text-muted-foreground">Disetujui pada:</span>
                  <span className="font-medium">
                    {format(new Date(ret.approvedAt), 'dd MMM yyyy HH:mm', {
                      locale: id,
                    })}
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
            <AlertTitle>Return Ditolak</AlertTitle>
            <AlertDescription>
              Permintaan return ini telah ditolak. Stok tidak dikurangi.
            </AlertDescription>
          </Alert>
        )}

        {/* Middle Section: Items */}
        <Card>
          <CardHeader>
            <CardTitle>Item yang Di-return</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className="text-right">Qty Return</TableHead>
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
            <CardTitle>Catatan & Alasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 text-sm font-medium">
                Alasan Pengembalian:
              </div>
              <p className="text-sm text-muted-foreground">
                {ret.reason || '-'}
              </p>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">Catatan Tambahan:</div>
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
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status menjadi{' '}
              <span className="font-bold uppercase">{nextStatus}</span>?
              {nextStatus === 'completed' && (
                <div className="mt-2 text-destructive">
                  Peringatan: Tindakan ini akan mengurangi stok barang di gudang
                  secara otomatis.
                </div>
              )}
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
        isDeleting={deleteMutation.isPending}
        title="Hapus Purchase Return?"
        description="Apakah Anda yakin ingin menghapus permintaan return ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
