'use client';

import { PosHeader } from '@/components/pos/pos-header';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bizflow/ui';
import { ArrowLeft, Check, X, CreditCard, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useReturnDetail } from '@/hooks/use-returns';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import {
  ApproveReturnDialog,
  RejectReturnDialog,
  ProcessRefundDialog,
} from '@/components/pos/returns/return-action-dialogs';

export default function ReturnDetailPage() {
  const { id } = useParams();
  const returnId = Array.isArray(id) ? id[0] : id;
  const { data, isLoading } = useReturnDetail(returnId || '');

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  const ret = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/10">
        <p>Loading...</p>
      </div>
    );
  }

  if (!ret) {
    return (
      <div className="flex bg-muted/10 h-screen flex-col">
        <PosHeader />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">Retur tidak ditemukan.</p>
          <Link href="/pos/returns">
            <Button>Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/10">
      <PosHeader />

      <div className="flex-1 p-6 space-y-6 overflow-auto max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pos/returns">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ret.returnNumber}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>
                  {format(new Date(ret.createdAt), 'dd MMMM yyyy HH:mm', {
                    locale: idLocale,
                  })}
                </span>
                <span>•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ret.status)} uppercase`}
                >
                  {ret.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {ret.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowReject(true)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Tolak
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowApprove(true)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Setujui
                </Button>
              </>
            )}
            {ret.status === 'approved' && (
              <Button onClick={() => setShowRefund(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proses Refund
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Retur</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead>Alasan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ret.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">
                            {item.orderItem?.variant?.product?.name ||
                              'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.orderItem?.variant?.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell>{item.reason || ret.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {ret.refundAmount > 0 &&
              (status === 'completed' || status === 'approved') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Info Refund</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">
                        Total Refund
                      </span>
                      <span className="text-xl font-bold">
                        {formatCurrency(Number(ret.refundAmount))}
                      </span>
                    </div>
                    {ret.refundMethod && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Metode</span>
                        <span className="font-medium capitalize">
                          {ret.refundMethod}
                        </span>
                      </div>
                    )}
                    {/* Add Refund Transaction info if available in API response */}
                  </CardContent>
                </Card>
              )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Info Transaksi Asal</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <p className="text-muted-foreground">No. Order</p>
                  <p className="font-medium text-primary">
                    {ret.order?.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal Order</p>
                  <p className="font-medium">
                    {ret.order?.createdAt
                      ? format(new Date(ret.order.createdAt), 'dd MMM yyyy', {
                          locale: idLocale,
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">
                    {ret.order?.customer?.name || 'Umum'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Catatan Retur</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {ret.notes ? (
                  <p>{ret.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Tidak ada catatan
                  </p>
                )}
                <Separator className="my-4" />
                <div>
                  <p className="text-muted-foreground mb-1">Dibuat Oleh</p>
                  <p className="font-medium">
                    {ret.createdBy?.username || 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showApprove && (
        <ApproveReturnDialog
          id={ret.id}
          open={showApprove}
          onOpenChange={setShowApprove}
        />
      )}
      {showReject && (
        <RejectReturnDialog
          id={ret.id}
          open={showReject}
          onOpenChange={setShowReject}
        />
      )}
      {showRefund && (
        <ProcessRefundDialog
          id={ret.id}
          amount={Number(ret.refundAmount)}
          open={showRefund}
          onOpenChange={setShowRefund}
        />
      )}
    </div>
  );
}
