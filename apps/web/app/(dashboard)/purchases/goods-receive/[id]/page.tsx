'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  StoreIcon,
  ArrowLeft,
  Trash,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bizflow/ui';

import { goodsReceiveService } from '@/services/goods-receive.service';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  useDeleteGoodsReceive,
  useGoodsReceive,
} from '@/hooks/use-goods-receive';

export default function GoodsReceiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: goodsReceive,
    isLoading,
    refetch,
    isError,
  } = useGoodsReceive(resolvedParams.id);

  const deleteMutation = useDeleteGoodsReceive();

  useBreadcrumb(
    `/purchases/goods-receive/${resolvedParams.id}`,
    goodsReceive?.receiveNumber || 'Detail',
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !goodsReceive) {
    return (
      <ErrorState
        title="Gagal memuat detail penerimaan barang"
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(goodsReceive.id, {
      onSuccess: () => {
        router.push('/purchases/goods-receive');
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
            onClick={() => router.push('/purchases/goods-receive')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {goodsReceive.receiveNumber}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(goodsReceive.receiveDate), 'dd MMMM yyyy', {
                    locale: id,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Hapus
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Section: General Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sumber</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">No. PO</div>
                  <Link
                    href={`/purchases/orders/${goodsReceive.purchaseOrderId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {goodsReceive.purchaseOrder?.orderNumber}
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Pemasok</div>
                  <div className="font-medium">
                    {goodsReceive.purchaseOrder?.supplier?.name}
                  </div>
                  {goodsReceive.purchaseOrder?.supplier?.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{goodsReceive.purchaseOrder.supplier.address}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {goodsReceive.purchaseOrder?.supplier?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{goodsReceive.purchaseOrder.supplier.phone}</span>
                      </div>
                    )}
                    {goodsReceive.purchaseOrder?.supplier?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{goodsReceive.purchaseOrder.supplier.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Lainnya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Gudang:</span>
                <span className="font-medium text-right flex-1">
                  {goodsReceive.warehouse?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dibuat Pada:</span>
                <span className="font-medium text-right flex-1">
                  {format(
                    new Date(goodsReceive.createdAt),
                    'dd MMMM yyyy HH:mm',
                    {
                      locale: id,
                    },
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dibuat Oleh:</span>
                <span className="font-medium text-right flex-1">
                  {goodsReceive.creator?.name || goodsReceive.createdBy}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Item Diterima</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Qty Dipesan</TableHead>
                  <TableHead className="text-right">Qty Diterima</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goodsReceive.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.purchaseOrderItem?.variant?.product?.name ||
                          'Produk dihapus'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.purchaseOrderItem?.variant?.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.purchaseOrderItem?.quantity || 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {Number(item.receivedQty || 0)}
                    </TableCell>
                    <TableCell>{item.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Notes Section */}
        {goodsReceive.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Catatan Penerimaan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {goodsReceive.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title="Hapus Penerimaan Barang?"
        description={
          <>
            Apakah Anda yakin ingin menghapus penerimaan ini?
            <br />
            <br />
            <span className="text-destructive font-semibold">PERINGATAN:</span>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>Stok yang sudah diterima akan dikurangi kembali.</li>
              <li>Status Purchase Order akan disesuaikan.</li>
            </ul>
          </>
        }
      />
    </div>
  );
}
